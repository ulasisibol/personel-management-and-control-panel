const { sql, getConnection } = require("../config/dbConfig");

exports.addAbsenteeism = async (req, res) => {
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
                INSERT INTO PersonnelAbsenteeism (personnel_id, start_date, end_date, description)
                VALUES (@personnel_id, @start_date, @end_date, @description)
            `);

        res.status(201).json({ success: true, message: "Devamsızlık başarıyla eklendi." });
    } catch (error) {
        console.error("Error adding absenteeism:", error);
        res.status(500).json({ success: false, message: "Devamsızlık eklenirken bir hata oluştu." });
    }
};

exports.getAbsenteeism = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT pa.id, pa.start_date, pa.end_date, pa.description, p.first_name, p.last_name
            FROM PersonnelAbsenteeism pa
            INNER JOIN personnel p ON pa.personnel_id = p.personnel_id
            ORDER BY pa.start_date
        `);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error fetching absenteeism:", error);
        res.status(500).json({ success: false, message: "Devamsızlık listesi alınamadı." });
    }
};

exports.deleteAbsenteeism = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: "Devamsızlık ID gereklidir." });
    }

    try {
        const pool = await getConnection();
        await pool.request()
            .input("id", sql.Int, id)
            .query(`
                DELETE FROM PersonnelAbsenteeism WHERE id = @id
            `);

        res.status(200).json({ success: true, message: "Devamsızlık başarıyla silindi." });
    } catch (error) {
        console.error("Error deleting absenteeism:", error);
        res.status(500).json({ success: false, message: "Devamsızlık silinirken bir hata oluştu." });
    }
};
