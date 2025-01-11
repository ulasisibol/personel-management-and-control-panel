const { sql, getConnection } = require('../config/dbConfig');

// controllers/personnelController.js
const addPersonnel = async (req, res) => {
    const {
        first_name,
        last_name,
        job_title,
        department_id,
        manager_id,
        email,
        phone,
        address,
        hire_date,
        salary
    } = req.body;

    const profileImageBuffer = req.file ? req.file.buffer : null;

    try {
        // 1) Eğer admin değilse, sadece kendi departmanına eklemesine izin ver.
        if (!req.user.isSuperUser && department_id != req.user.departmentId) {
            return res.status(403).json({ message: 'Sadece kendi departmanınıza personel ekleyebilirsiniz.' });
        }

        // 2) Veritabanına ekleme
        const pool = await getConnection();
        await pool.request()
            .input('first_name', sql.VarChar(50), first_name)
            .input('last_name', sql.VarChar(50), last_name)
            .input('job_title', sql.VarChar(100), job_title)
            .input('department_id', sql.Int, department_id)
            .input('manager_id', sql.Int, manager_id || null)
            .input('email', sql.VarChar(100), email)
            .input('phone', sql.VarChar(20), phone)
            .input('address', sql.VarChar(255), address)
            .input('hire_date', sql.Date, hire_date)
            .input('salary', sql.Decimal(10, 2), salary || null)
            .input('profile_image', sql.VarBinary(sql.MAX), profileImageBuffer)
            .query(`
                INSERT INTO personnel (
                    first_name, last_name, job_title, department_id, manager_id,
                    email, phone, address, hire_date, salary, profile_image
                )
                VALUES (
                    @first_name, @last_name, @job_title, @department_id, @manager_id,
                    @email, @phone, @address, @hire_date, @salary, @profile_image
                );
            `);

        res.status(201).json({ message: 'Personel başarıyla eklendi.' });
    } catch (error) {
        console.error('Personel ekleme hatası:', error.message);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};



// Personel silme
const deletePersonnel = async (req, res) => {
    const { personnel_id } = req.params;
    try {
        const pool = await getConnection();
        await pool.request()
            .input('personnel_id', sql.Int, personnel_id)
            .query(`
                DELETE FROM dbo.personnel WHERE personnel_id = @personnel_id;
            `);
        res.status(200).json({ message: 'Personel başarıyla silindi.' });
    } catch (error) {
        console.error('Personel silme hatası:', error.message);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Personel güncelleme
const updatePersonnel = async (req, res) => {
    const { personnel_id } = req.params;
    const {
        first_name,
        last_name,
        job_title,
        department_id, // department yerine department_id kullanılıyor
        manager_id,
        email,
        phone,
        address,
        hire_date,
        salary
    } = req.body;

    try {
        const pool = await getConnection();
        await pool.request()
            .input('personnel_id', sql.Int, personnel_id)
            .input('first_name', sql.VarChar(50), first_name)
            .input('last_name', sql.VarChar(50), last_name)
            .input('job_title', sql.VarChar(100), job_title)
            .input('department_id', sql.Int, department_id || null) // department_id kullanımı
            .input('manager_id', sql.Int, manager_id || null)
            .input('email', sql.VarChar(100), email)
            .input('phone', sql.VarChar(20), phone)
            .input('address', sql.VarChar(255), address)
            .input('hire_date', sql.Date, hire_date)
            .input('salary', sql.Decimal(10, 2), salary || null)
            .query(`
                UPDATE dbo.personnel
                SET first_name = @first_name,
                    last_name = @last_name,
                    job_title = @job_title,
                    department_id = @department_id, -- department yerine department_id
                    manager_id = @manager_id,
                    email = @email,
                    phone = @phone,
                    address = @address,
                    hire_date = @hire_date,
                    salary = @salary,
                    updated_at = GETDATE()
                WHERE personnel_id = @personnel_id;
            `);

        res.status(200).json({ message: 'Personel başarıyla güncellendi.' });
    } catch (error) {
        console.error('Personel güncelleme hatası:', error.message);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

const listPersonnel = async (req, res) => {
    try {
        const pool = await getConnection();

        const userDepartmentId = req.user.departmentId;
        const isSuperUser = req.user.isSuperUser;

        const query = `
            SELECT 
                p.personnel_id,
                p.first_name,
                p.last_name,
                p.job_title,
                p.department_id,
                d.departman_adi AS department_name,
                p.email,
                p.phone,
                p.address,
                p.hire_date,
                p.salary,
                p.profile_image
            FROM dbo.personnel p
            LEFT JOIN dbo.departman d ON p.department_id = d.departman_id
            ${!isSuperUser ? 'WHERE p.department_id = @departmentId' : ''}
        `;

        const request = pool.request();
        if (!isSuperUser) {
            request.input('departmentId', sql.Int, userDepartmentId);
        }

        const result = await request.query(query);

        // Base64 Dönüşümü
        const personnelWithBase64 = result.recordset.map((row) => {
            let base64Image = null;
            if (row.profile_image) {
                base64Image = Buffer.from(row.profile_image).toString('base64');
            }
            return {
                ...row,
                base64Image, // yeni property
            };
        });

        res.status(200).json(personnelWithBase64);
    } catch (error) {
        console.error('Personel listeleme hatası:', error.message);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};


module.exports = {
    addPersonnel,
    deletePersonnel,
    updatePersonnel,
    listPersonnel
};
