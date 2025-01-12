// controllers/shortcutController.js
const { sql, getConnection } = require('../config/dbConfig');

// Kısayol oluştur
exports.createShortcut = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id; // JWT'den gelen kullanıcı ID

        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required." });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('title', sql.NVarChar(255), title)
            .input('description', sql.NVarChar(sql.MAX), description || null)
            .query(`
                INSERT INTO Shortcuts (user_id, title, description)
                OUTPUT INSERTED.*
                VALUES (@userId, @title, @description)
            `);

        res.status(201).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error("Error creating shortcut:", error.message);
        res.status(500).json({ success: false, message: "Failed to create shortcut." });
    }
};

// Tüm kısayolları getir (Sadece kullanıcıya özel)
exports.getShortcuts = async (req, res) => {
    try {
        const userId = req.user.id; // JWT'den gelen kullanıcı ID

        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT * FROM Shortcuts
                WHERE user_id = @userId
                ORDER BY created_at DESC
            `);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error fetching shortcuts:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch shortcuts." });
    }
};

// Kısayol sil
exports.deleteShortcut = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // JWT'den gelen kullanıcı ID

        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.Int, userId)
            .query(`
                DELETE FROM Shortcuts
                WHERE id = @id AND user_id = @userId
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: "Shortcut not found or not authorized to delete." });
        }

        res.status(200).json({ success: true, message: "Shortcut deleted successfully." });
    } catch (error) {
        console.error("Error deleting shortcut:", error.message);
        res.status(500).json({ success: false, message: "Failed to delete shortcut." });
    }
};
