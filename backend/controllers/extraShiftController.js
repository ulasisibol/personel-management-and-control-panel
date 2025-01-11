const { sql, getConnection } = require("../config/dbConfig");

exports.createExtraWork = async (req, res) => {
    try {
        const { personnel_id, work_date, extra_hours, description } = req.body;

        if (!personnel_id || !work_date || !extra_hours) {
            return res.status(400).json({ message: "Personel ID, tarih ve saat, ekstra saat zorunludur." });
        }

        const pool = await getConnection();
        await pool.request()
            .input("personnel_id", sql.Int, personnel_id)
            .input("work_date", sql.DateTime, work_date)
            .input("extra_hours", sql.Int, extra_hours)
            .input("description", sql.NVarChar, description || null)
            .query(`
                INSERT INTO ExtraWork (personnel_id, work_date, extra_hours, description)
                VALUES (@personnel_id, @work_date, @extra_hours, @description)
            `);

        res.status(201).json({ success: true, message: "Ekstra mesai başarıyla kaydedildi." });
    } catch (error) {
        console.error("createExtraWork error:", error.message);
        res.status(500).json({ success: false, message: "Sunucu hatası." });
    }
};


exports.getExtraWork = async (req, res) => {
    try {
        const personnel_id = req.query.personnel_id; // Personel ID filtreleme için opsiyonel
        const pool = await getConnection();

        let query = `
            SELECT ew.id, ew.personnel_id, p.first_name, p.last_name, ew.work_date, ew.extra_hours, ew.description
            FROM ExtraWork ew
            INNER JOIN personnel p ON ew.personnel_id = p.personnel_id
        `;

        if (personnel_id) {
            query += " WHERE ew.personnel_id = @personnel_id";
        }

        const request = pool.request();
        if (personnel_id) {
            request.input("personnel_id", sql.Int, personnel_id);
        }

        const result = await request.query(query);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("getExtraWork error:", error.message);
        res.status(500).json({ success: false, message: "Mesai listesi alınamadı." });
    }
};

exports.deleteExtraWork = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Mesai ID zorunludur." });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM ExtraWork WHERE id = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Mesai kaydı bulunamadı." });
        }

        res.status(200).json({ success: true, message: "Mesai başarıyla silindi." });
    } catch (error) {
        console.error("deleteExtraWork error:", error.message);
        res.status(500).json({ success: false, message: "Sunucu hatası." });
    }
};

exports.updateExtraWork = async (req, res) => {
    try {
        const { id } = req.params;
        const { work_date, extra_hours, description } = req.body;

        if (!id || !work_date || !extra_hours) {
            return res.status(400).json({ message: "ID, tarih ve ekstra saat zorunludur." });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("work_date", sql.DateTime, work_date)
            .input("extra_hours", sql.Int, extra_hours)
            .input("description", sql.NVarChar, description || null)
            .query(`
                UPDATE ExtraWork
                SET work_date = @work_date, extra_hours = @extra_hours, description = @description
                WHERE id = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Mesai kaydı bulunamadı." });
        }

        res.status(200).json({ success: true, message: "Mesai başarıyla güncellendi." });
    } catch (error) {
        console.error("updateExtraWork error:", error.message);
        res.status(500).json({ success: false, message: "Sunucu hatası." });
    }
};


exports.getPersonnel = async (req, res) => {
    try {
        const isSuperUser = req.user?.isSuperUser; // Kullanıcının admin olup olmadığını kontrol et
        const departmentId = req.user?.departmentId; // Kullanıcının departman ID'si

        let query = `
            SELECT 
                id AS personnel_id, 
                first_name, 
                last_name, 
                department_id 
            FROM [dbo].[personnel]
        `;

        // Eğer admin değilse, sadece kendi departmanına ait personelleri getir
        if (!isSuperUser) {
            query += ` WHERE department_id = @departmentId`;
        }

        const pool = await getConnection();
        const request = pool.request();

        if (!isSuperUser) {
            request.input("departmentId", sql.Int, departmentId);
        }

        const result = await request.query(query);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error fetching personnel:", error.message);
        res.status(500).json({ success: false, message: "Personel listesi alınamadı." });
    }
};
