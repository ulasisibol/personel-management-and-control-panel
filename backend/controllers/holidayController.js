const { sql, getConnection } = require("../config/dbConfig");

// Tatil ekleme
exports.addHoliday = async (req, res) => {
    const { personnel_id, start_date, end_date, description } = req.body;

    if (!personnel_id || !start_date || !end_date) {
        return res.status(400).json({ success: false, message: "Tüm alanlar zorunludur." });
    }

    try {
        const pool = await getConnection();
        await pool.request()
            .input("personnel_id", sql.Int, personnel_id)
            .input("start_date", sql.Date, start_date)
            .input("end_date", sql.Date, end_date)
            .input("description", sql.NVarChar, description || null)
            .query(`
                INSERT INTO PersonnelHolidays (personnel_id, start_date, end_date, description)
                VALUES (@personnel_id, @start_date, @end_date, @description)
            `);

        res.status(201).json({ success: true, message: "Tatil başarıyla eklendi." });
    } catch (error) {
        console.error("Error adding holiday:", error);
        res.status(500).json({ success: false, message: "Tatil eklenirken bir hata oluştu." });
    }
};

// Tatilleri listeleme
exports.getHolidays = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                ph.id, 
                ph.start_date, 
                ph.end_date, 
                ph.description, 
                p.first_name, 
                p.last_name 
            FROM PersonnelHolidays ph
            INNER JOIN personnel p ON ph.personnel_id = p.personnel_id
            ORDER BY ph.start_date;
        `);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error fetching holidays:", error);
        res.status(500).json({ success: false, message: "Tatil listesi alınamadı." });
    }
};

// Tatil silme
exports.deleteHoliday = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: "Tatil ID gereklidir." });
    }

    try {
        const pool = await getConnection();
        await pool.request()
            .input("id", sql.Int, id)
            .query(`
                DELETE FROM PersonnelHolidays WHERE id = @id
            `);

        res.status(200).json({ success: true, message: "Tatil başarıyla silindi." });
    } catch (error) {
        console.error("Error deleting holiday:", error);
        res.status(500).json({ success: false, message: "Tatil silinirken bir hata oluştu." });
    }
};

// Personelleri listeleme
exports.getPersonnel = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                personnel_id, 
                first_name, 
                last_name, 
                department_id 
            FROM personnel;
        `);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error fetching personnel:", error);
        res.status(500).json({ success: false, message: "Personel listesi alınamadı." });
    }
};
