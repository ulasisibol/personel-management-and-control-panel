const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, getConnection } = require('../config/dbConfig');

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .query(`
                SELECT id, username, password, is_super_user 
                FROM users 
                WHERE username = @username
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }

        const user = result.recordset[0];
        console.log('Database user data:', user);

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }

        const isSuperUser = Boolean(user.is_super_user);
        console.log('is_super_user value:', user.is_super_user);
        console.log('Converted isSuperUser:', isSuperUser);

        const token = jwt.sign(
            { userId: user.id, isSuperUser: isSuperUser },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                isSuperUser: isSuperUser
            },
            message: 'Giriş başarılı'
        });

    } catch (err) {
        console.error('Login hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

const addUser = async (req, res) => {
    const { username, password, isSuperUser, departmentId } = req.body;
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
                console.log('departman yok, rollback yapılıyor');
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

        // 3) Commit
        await transaction.commit();
        console.log('Transaction commit yapıldı');

        return res.status(201).json({
            message: 'Kullanıcı başarıyla oluşturuldu ve yönetici olarak ilişkilendirildi.',
            user: newUser,
            departmentId: departmentId || null

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
          d.departman_id,
          d.departman_adi
        FROM users AS u
        LEFT JOIN departman_yoneticileri AS dy ON u.id = dy.user_id
        LEFT JOIN departman AS d ON dy.departman_id = d.departman_id;
      `;

        const result = await pool.request().query(query);

        const users = result.recordset.map(row => ({
            id: row.user_id,
            username: row.username,
            isSuperUser: row.is_super_user,
            department: row.departman_adi || 'Yok'
        }));

        res.status(200).json(users);
    } catch (err) {
        console.error('Kullanıcı listeleme hatası:', err.message);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};


/**
 * [DELETE] /api/auth/users/:userId
 * Kullanıcı silme
 */
const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const pool = await getConnection();
        await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                DELETE FROM users 
                WHERE id = @userId;
            `);
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
    deleteUser
};
