// controllers/announcementController.js
const { sql, getConnection } = require('../config/dbConfig');

// Duyuru ekle
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, departments, isFromDepartment = false } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required." });
        }

        const createdBy = req.user.isSuperUser
            ? "Admin"
            : `${req.user.firstName} ${req.user.lastName}`;

        const pool = await getConnection();
        const result = await pool.request()
            .input("title", sql.NVarChar(255), title)
            .input("content", sql.NVarChar(sql.MAX), content)
            .input("createdBy", sql.NVarChar(255), createdBy)
            .input("targetDepartments", sql.NVarChar(sql.MAX), JSON.stringify(departments || []))
            .input("isFromDepartment", sql.Bit, isFromDepartment)
            .query(`
          INSERT INTO announcements (title, content, created_by, target_departments, is_from_department)
          OUTPUT INSERTED.id
          VALUES (@title, @content, @createdBy, @targetDepartments, @isFromDepartment)
        `);

        res.status(201).json({ success: true, message: "Announcement created successfully.", id: result.recordset[0].id });
    } catch (error) {
        console.error("createAnnouncement error:", error.message);
        res.status(500).json({ success: false, message: "Failed to create announcement." });
    }
};


exports.getAnnouncements = async (req, res) => {
    try {
        const userDepartmentId = req.user.departmentId; // Tokendan gelen departman ID
        const isSuperUser = req.user.isSuperUser; // Tokendan gelen admin bilgisi

        let query = `
            SELECT id, title, content, created_at, target_departments, is_from_department
            FROM [dbo].[announcements]
        `;

        if (!isSuperUser) {
            // Departman kullanıcıları sadece kendi duyurularını görür
            query += `
                WHERE EXISTS (
                    SELECT 1 FROM OPENJSON(target_departments)
                    WHERE value = '${userDepartmentId}'
                )
            `;
        }

        const pool = await getConnection();
        const result = await pool.request().query(query);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('getAnnouncements error:', error.message);
        res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
};

// Duyuru tekrar yayınla
exports.republishAnnouncement = async (req, res) => {
    try {
        const { announcementId, target_departments } = req.body;
        const adminId = req.user.userId; // Admin ID

        const pool = await getConnection();
        await pool.request()
            .input('announcementId', sql.Int, announcementId)
            .input('targetDepartments', sql.NVarChar(sql.MAX), JSON.stringify(target_departments))
            .input('updatedAt', sql.DateTime, new Date())
            .query(`
                UPDATE [dbo].[announcements]
                SET 
                    target_departments = @targetDepartments,
                    updated_at = @updatedAt,
                    is_from_department = 0 -- Admin tarafından tekrar yayınlandığı için
                WHERE id = @announcementId
            `);

        res.status(200).json({ success: true, message: 'Duyuru tekrar yayınlandı' });
    } catch (error) {
        console.error('republishAnnouncement error:', error.message);
        res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
};

