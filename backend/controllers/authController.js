const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, getConnection } = require('../config/dbConfig');

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await getConnection();

        // 1) Kullanıcı bilgilerini çek
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .query(`
                SELECT 
                    u.id AS user_id, 
                    u.username, 
                    u.password, 
                    u.is_super_user,         -- 0/1 veya bit tipinde tutulan alan
                    dy.departman_id AS department_id
                FROM users u
                LEFT JOIN departman_yoneticileri dy ON u.id = dy.user_id
                WHERE u.username = @username
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = result.recordset[0];
        console.log('Database user data:', user);

        // 2) Şifre kontrolü
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // 3) is_super_user -> boolean
        const isSuperUser = Boolean(user.is_super_user); // 0 => false, 1 => true
        const departmentId = user.department_id || null;

        // 4) Token oluştur
        const token = jwt.sign(
            {
                userId: user.user_id,
                isSuperUser,    // mesela true/false
                departmentId    // 3 veya null
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 5) Cevabı döndür
        res.json({
            token,
            user: {
                id: user.user_id,
                username: user.username,
                isSuperUser,
                departmentId,
            },
            message: 'Giriş başarılı'
        });

    } catch (err) {
        console.error('Login hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

const addUser = async (req, res) => {
    const { username, password, isSuperUser, departmentId, personnelId } = req.body; // personnelId eklendi
    let transaction;

    try {
        console.log('addUser fonksiyonu başladı, gelen body:', req.body);

        const pool = await getConnection();
        transaction = new sql.Transaction(pool);
        await transaction.begin();
        console.log('Transaction başladı');

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Parola hash’lendi:', hashedPassword);

        // 1) Kullanıcı ekleme
        const result = await new sql.Request(transaction)
            .input('username', sql.VarChar(50), username)
            .input('password', sql.VarChar(255), hashedPassword)
            .input('isSuperUser', sql.Bit, isSuperUser ? 1 : 0)
            .query(`
                INSERT INTO users (username, password, is_super_user, created_at) 
                OUTPUT INSERTED.id, INSERTED.username, INSERTED.is_super_user
                VALUES (@username, @password, @isSuperUser, GETDATE());
            `);

        console.log('Kullanıcı eklendi, result:', result.recordset);

        const newUser = result.recordset[0];
        const newUserId = newUser.id;
        console.log('Yeni kullanıcının ID’si:', newUserId);

        // 2) Ara tabloya ekle
        if (departmentId) {
            console.log('departmentId geldi:', departmentId);

            // Departman kontrolü
            const checkDeptResult = await new sql.Request(transaction)
                .input('departmentId', sql.Int, departmentId)
                .query(`
                    SELECT departman_id
                    FROM departman
                    WHERE departman_id = @departmentId
                `);

            if (checkDeptResult.recordset.length === 0) {
                console.log('Geçersiz departmanId, rollback yapılıyor');
                await transaction.rollback();
                return res.status(400).json({ message: 'Geçersiz departmanId' });
            }

            console.log('Departman mevcut, ara tabloya ekleniyor');
            await new sql.Request(transaction)
                .input('departmentId', sql.Int, departmentId)
                .input('userId', sql.Int, newUserId)
                .query(`
                    INSERT INTO departman_yoneticileri (departman_id, user_id)
                    VALUES (@departmentId, @userId);
                `);

            console.log('Ara tabloya eklendi');
        }

        // 3) Personel kontrolü ve eşleştirme
        if (personnelId) {
            console.log('personnelId geldi:', personnelId);

            // Personelin departmanı kontrol et
            const personnelDept = await new sql.Request(transaction)
                .input('personnelId', sql.Int, personnelId)
                .query(`
                    SELECT department_id
                    FROM personnel
                    WHERE personnel_id = @personnelId;
                `);

            if (personnelDept.recordset.length === 0) {
                console.log('Personel bulunamadı, rollback yapılıyor');
                await transaction.rollback();
                return res.status(400).json({ message: 'Geçersiz personnelId' });
            }

            const personnelDepartmentId = personnelDept.recordset[0].department_id;

            if (departmentId && personnelDepartmentId !== departmentId) {
                console.log('Personel ve departman eşleşmiyor, rollback yapılıyor');
                await transaction.rollback();
                return res.status(400).json({ message: 'Personel, seçilen departmana ait değil.' });
            }

            console.log('Personel departman doğrulaması tamamlandı');

            // Personelin `manager_id` alanını güncelle
            await new sql.Request(transaction)
                .input('personnelId', sql.Int, personnelId)
                .input('userId', sql.Int, newUserId)
                .query(`
                    UPDATE personnel
                    SET manager_id = @userId
                    WHERE personnel_id = @personnelId;
                `);

            console.log('Personel manager_id güncellendi');
        }

        // 4) Commit
        await transaction.commit();
        console.log('Transaction commit yapıldı');

        return res.status(201).json({
            message: 'Kullanıcı başarıyla oluşturuldu ve personel ilişkilendirildi.',
            user: newUser,
            departmentId: departmentId || null,
        });
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
            console.log('Transaction rollback yapıldı, hata nedeniyle');
        }
        console.error('Kullanıcı oluşturma hatası:', err);
        return res.status(500).json({ message: 'Sunucu hatası' });
    }
};


/**
 * [GET] /api/auth/users
 * Tüm kullanıcıları listeleme
 */
const listUsers = async (req, res) => {
    try {
        const pool = await getConnection();

        const query = `
            SELECT 
                u.id AS user_id,
                u.username,
                u.is_super_user,
                p.first_name AS personnel_first_name,
                p.last_name AS personnel_last_name,
                d.departman_id,
                d.departman_adi,
                (SELECT COUNT(*) 
                 FROM personnel 
                 WHERE department_id = d.departman_id) AS calisan_sayisi
            FROM users AS u
            LEFT JOIN personnel AS p ON u.id = p.manager_id
            LEFT JOIN departman_yoneticileri AS dy ON u.id = dy.user_id
            LEFT JOIN departman AS d ON dy.departman_id = d.departman_id;
        `;

        const result = await pool.request().query(query);

        const users = result.recordset.map(row => ({
            id: row.user_id,
            username: row.username,
            isSuperUser: row.is_super_user,
            personnel: {
                firstName: row.personnel_first_name,
                lastName: row.personnel_last_name,
            },
            department: {
                id: row.departman_id,
                name: row.departman_adi,
                employeeCount: row.calisan_sayisi,
            },
        }));

        res.status(200).json(users);
    } catch (err) {
        console.error('Kullanıcı listeleme hatası:', err.message);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};


const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { username, password, departmentId } = req.body;

    let transaction;

    try {
        const pool = await getConnection();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Kullanıcı adı güncelleme
        if (username) {
            console.log('Kullanıcı adı güncelleniyor:', username);
            await new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .input('username', sql.VarChar(50), username)
                .query(`
                    UPDATE users
                    SET username = @username
                    WHERE id = @userId;
                `);
        }

        // Şifre güncelleme
        if (password) {
            console.log('Şifre güncelleniyor');
            const hashedPassword = await bcrypt.hash(password, 10);
            await new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .input('password', sql.VarChar(255), hashedPassword)
                .query(`
                    UPDATE users
                    SET password = @password
                    WHERE id = @userId;
                `);
        }

        // Departman güncelleme
        if (departmentId) {
            console.log('Departman güncelleniyor:', departmentId);

            // Kullanıcı departman ilişkisinin mevcut olup olmadığını kontrol et
            const checkDepartment = await new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT user_id
                    FROM departman_yoneticileri
                    WHERE user_id = @userId;
                `);

            if (checkDepartment.recordset.length > 0) {
                // Departman güncelleme
                console.log('Departman kaydı güncelleniyor');
                await new sql.Request(transaction)
                    .input('departmentId', sql.Int, departmentId)
                    .input('userId', sql.Int, userId)
                    .query(`
                        UPDATE departman_yoneticileri
                        SET departman_id = @departmentId
                        WHERE user_id = @userId;
                    `);
            } else {
                // Yeni kayıt ekleme
                console.log('Yeni departman kaydı ekleniyor');
                await new sql.Request(transaction)
                    .input('departmentId', sql.Int, departmentId)
                    .input('userId', sql.Int, userId)
                    .query(`
                        INSERT INTO departman_yoneticileri (departman_id, user_id)
                        VALUES (@departmentId, @userId);
                    `);
            }

            // Kullanıcı ile ilişkili personelin departmanını güncelle
            console.log('Kullanıcıyla eşleştirilmiş personel departmanı güncelleniyor');
            const updateLinkedPersonnel = await new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .input('departmentId', sql.Int, departmentId)
                .query(`
                    UPDATE personnel
                    SET department_id = @departmentId
                    WHERE manager_id = @userId;
                `);

            if (updateLinkedPersonnel.rowsAffected[0] === 0) {
                console.warn('Eşleştirilmiş personel kaydı bulunamadı.');
            } else {
                console.log('Personel departmanı başarıyla güncellendi.');
            }
        }

        await transaction.commit();
        console.log('Transaction başarıyla tamamlandı.');
        res.status(200).json({ message: 'Kullanıcı ve personel departman bilgisi başarıyla güncellendi.' });
    } catch (err) {
        console.error('Kullanıcı güncelleme hatası:', err.message);
        if (transaction) {
            await transaction.rollback();
            console.log('Transaction geri alındı.');
        }
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};




/**
 * [DELETE] /api/auth/users/:userId
 * Kullanıcı silme
 */
const deleteUser = async (req, res) => {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: 'Geçersiz kullanıcı ID.' });
    }

    try {
        const pool = await getConnection();

        // Bağımlı verileri sil
        await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                DELETE FROM departman_yoneticileri 
                WHERE user_id = @userId;
            `);

        // Kullanıcıyı sil
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                DELETE FROM users 
                WHERE id = @userId;
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        res.status(200).json({ message: 'Kullanıcı başarıyla silindi.' });
    } catch (error) {
        console.error('Kullanıcı silme hatası:', error.message);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};


module.exports = {
    loginUser,
    addUser,
    listUsers,
    deleteUser,
    updateUser
};
