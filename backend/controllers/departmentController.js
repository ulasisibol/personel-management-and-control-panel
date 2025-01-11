// departmentController.js

const { sql, getConnection } = require('../config/dbConfig');

/**
 * [POST] /api/departments
 * Yeni departman oluşturma
 */
const createDepartment = async (req, res) => {
    let transaction;
    try {
        const { departmanAdi } = req.body;
        if (!departmanAdi) {
            return res.status(400).json({ message: 'Departman adı zorunludur.' });
        }

        const pool = await getConnection();
        // Transaction başlat
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Departman ekleme sorgusu
        const insertQuery = `
            INSERT INTO departman (departman_adi, yonetici_id, calisan_sayisi)
            VALUES (@departmanAdi, 0, 0);
        `;

        // Parametreleri tanımlayarak sorguyu çalıştır
        const request = new sql.Request(transaction);
        request.input('departmanAdi', sql.VarChar(100), departmanAdi);
        await request.query(insertQuery);

        // Transaction'ı tamamla
        await transaction.commit();

        return res.status(201).json({ message: 'Departman başarıyla oluşturuldu.' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Departman oluşturma hatası:', error.message);
        return res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

/**
 * [POST] /api/departments/:departmentId/managers
 * Bir departmana yönetici ekleme (ara tablo: departman_yoneticileri)
 */
const addManager = async (req, res) => {
    let transaction;
    try {
        const { departmentId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID zorunludur.' });
        }

        const pool = await getConnection();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // 1) Departman var mı?
        const checkDeptQuery = `
            SELECT departman_id
            FROM departman
            WHERE departman_id = @departmentId
        `;
        let request = new sql.Request(transaction);
        request.input('departmentId', sql.Int, departmentId);
        const deptResult = await request.query(checkDeptQuery);

        if (deptResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Departman bulunamadı.' });
        }

        // 2) Kullanıcı var mı?
        const checkUserQuery = `
            SELECT id
            FROM [dbo].[users]
            WHERE id = @userId
        `;
        request = new sql.Request(transaction);
        request.input('userId', sql.Int, userId);
        const userResult = await request.query(checkUserQuery);

        if (userResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        // 3) departman_yoneticileri tablosuna kayıt
        const insertManagerQuery = `
            INSERT INTO departman_yoneticileri (departman_id, user_id)
            VALUES (@departmentId, @userId);
        `;
        request = new sql.Request(transaction);
        request.input('departmentId', sql.Int, departmentId);
        request.input('userId', sql.Int, userId);
        await request.query(insertManagerQuery);

        await transaction.commit();

        return res.status(201).json({
            message: `Kullanıcı (ID: ${userId}) departman (ID: ${departmentId}) için yönetici olarak eklendi.`,
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Yönetici ekleme hatası:', error.message);
        return res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

/**
 * [GET] /api/departments
 * Tüm departmanları listeleme
 */
const listDepartments = async (req, res) => {
    try {
        const pool = await getConnection();

        const query = `
            SELECT 
              d.departman_id,
              d.departman_adi,
              d.created_at, -- Eklenme tarihi
              COUNT(p.personnel_id) AS calisan_sayisi, -- Çalışan sayısı
              dy.user_id AS manager_user_id,
              u.username AS manager_username
            FROM departman AS d
            LEFT JOIN personnel AS p ON d.departman_id = p.department_id
            LEFT JOIN departman_yoneticileri AS dy ON d.departman_id = dy.departman_id
            LEFT JOIN users AS u ON dy.user_id = u.id
            GROUP BY d.departman_id, d.departman_adi, d.created_at, dy.user_id, u.username;
        `;

        const result = await pool.request().query(query);

        // Departmanları gruplandır
        const departmentsMap = {};

        result.recordset.forEach(row => {
            if (!departmentsMap[row.departman_id]) {
                departmentsMap[row.departman_id] = {
                    departman_id: row.departman_id,
                    departman_adi: row.departman_adi,
                    created_at: row.created_at,
                    calisan_sayisi: row.calisan_sayisi,
                    managers: []
                };
            }
            if (row.manager_user_id) {
                departmentsMap[row.departman_id].managers.push({
                    user_id: row.manager_user_id,
                    username: row.manager_username
                });
            }
        });

        res.status(200).json(Object.values(departmentsMap));
    } catch (err) {
        console.error('Departman listeleme hatası:', err.message);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};


/**
 * [DELETE] /api/departments/:departmentId
 * Departmanı silme
 */
const deleteDepartment = async (req, res) => {
    let transaction;
    try {
        const { departmentId } = req.params;

        const pool = await getConnection();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // 1) Departman var mı?
        const checkDeptQuery = `
            SELECT departman_id
            FROM departman
            WHERE departman_id = @departmentId
        `;
        let request = new sql.Request(transaction);
        request.input('departmentId', sql.Int, departmentId);
        const deptResult = await request.query(checkDeptQuery);

        if (deptResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Departman bulunamadı.' });
        }

        // 2) Departmanı sil
        const deleteQuery = `
            DELETE FROM departman
            WHERE departman_id = @departmentId;
        `;
        request = new sql.Request(transaction);
        request.input('departmentId', sql.Int, departmentId);
        await request.query(deleteQuery);

        await transaction.commit();
        return res.status(200).json({ message: 'Departman başarıyla silindi.' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Departman silme hatası:', error.message);
        return res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

module.exports = {
    createDepartment,
    addManager,
    listDepartments,
    deleteDepartment
};
