const fs = require('fs');
const { generateSQL, generateFriendlyNames } = require('../services/openaiService');
const path = require('path');
const { sql, getConnection } = require('../config/dbConfig'); // Veritabanı bağlantısını içeren modül

// Role mesajını dosyadan okuyan yardımcı işlev
function readRoleFromFile(filePath) {
    try {
        const roleContent = fs.readFileSync(filePath, 'utf8');
        return roleContent.trim();
    } catch (error) {
        console.error('Error reading role file:', error.message);
        throw error;
    }
}

// Role tanımının bulunduğu dosya yolu
const ROLE_FILE_PATH = path.join(__dirname, '../services/role/role.txt');

const roleMessage = readRoleFromFile(ROLE_FILE_PATH);

// Doğal dil sorgusunu işleyen controller
exports.handleNaturalQuery = async (req, res) => {
    const { naturalQuery } = req.body;

    try {
        const sqlJson = await generateSQL(naturalQuery, roleMessage); // JSON formatında SQL al
        res.status(200).json(sqlJson); // JSON'u doğrudan frontend'e gönder
    } catch (error) {
        console.error('Controller Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

async function transformResultWithAI(results) {
    if (!Array.isArray(results) || results.length === 0) {
        return { columns: [], data: [] };
    }

    // İlk satırdaki sütun isimlerini al
    const columns = Object.keys(results[0]);

    // Sütun isimlerini yapay zeka ile dönüştür
    let formattedColumns;
    try {
        formattedColumns = await generateFriendlyNames(columns);
    } catch (error) {
        console.error("Error generating friendly column names:", error.message);
        throw new Error("Failed to transform column names with AI.");
    }

    // Sonuçları dönüştürülmüş sütun isimleri ile eşleştir
    const data = results.map(row => {
        const formattedRow = {};
        for (let i = 0; i < columns.length; i++) {
            const originalColumn = columns[i];
            const formattedColumn = formattedColumns[i];
            formattedRow[formattedColumn] = row[originalColumn];
        }
        return formattedRow;
    });

    return { columns: formattedColumns, data };
}


// Yapay zeka destekli sorgu sonuçlarını işleyen controller
exports.getAIFormattedQueryResult = async (req, res) => {
    try {
        const { query } = req.body;

        // Gelen sorgunun boş olup olmadığını kontrol et
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'SQL query is required and must be a string.' });
        }


        // Veritabanı bağlantısını al
        const pool = await getConnection();

        // SQL sorgusunu çalıştır
        const result = await pool.request().query(query);

        // Sonuçları yapay zeka destekli olarak dönüştür
        const transformedResult = await transformResultWithAI(result.recordset);

        // Dönüştürülmüş sonuçları döndür
        return res.status(200).json(transformedResult);
    } catch (error) {
        console.error('Error executing AI query:', error.message);

        // OpenAI API hatasını detaylı döndürmek için hata mesajını ekliyoruz
        if (error.response && error.response.status) {
            return res.status(error.response.status).json({
                error: error.response.data || 'Error from OpenAI API',
            });
        }

        return res.status(500).json({ error: 'An error occurred while executing the query.' });
    }
};


exports.saveQuery = async (req, res) => {
    try {
        const { title, query, department_id, isPublic } = req.body;

        const pool = await getConnection();
        await pool.request()
            .input("title", sql.NVarChar, title)
            .input("query", sql.NVarChar, query)
            .input("department_id", sql.Int, department_id || null)
            .input("isPublic", sql.Bit, isPublic || true)
            .query(`
                INSERT INTO queries (title, query, department_id, is_public)
                VALUES (@title, @query, @department_id, @isPublic)
            `);

        res.status(201).json({ message: "Query saved successfully!" });
    } catch (error) {
        console.error("Error saving query:", error.message);
        res.status(500).json({ error: "Failed to save query." });
    }
};

exports.deleteQuery = async (req, res) => {
    try {
        const { id } = req.params; // Silinecek query'nin ID'si

        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                DELETE FROM queries
                WHERE id = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Query not found." });
        }

        res.status(200).json({ message: "Query deleted successfully!" });
    } catch (error) {
        console.error("Error deleting query:", error.message);
        res.status(500).json({ error: "Failed to delete query." });
    }
};


exports.getQueries = async (req, res) => {
    try {
        const { department_id, isSuperUser } = req.user; // Kullanıcı bilgilerinden departman ve admin bilgisi alınır.

        const pool = await getConnection();

        let query = `
            SELECT id, title, query, department_id, is_public, created_at
            FROM queries
        `;

        // Sadece admin olmayanlar için filtreleme yap
        if (!isSuperUser) {
            query += `
                WHERE is_public = 1 OR department_id = @department_id
            `;
        }

        query += ` ORDER BY created_at DESC `;

        const request = pool.request();

        // Eğer admin değilse departman_id'yi sorguya ekle
        if (!isSuperUser) {
            request.input("department_id", sql.Int, department_id);
        }

        const result = await request.query(query);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error fetching queries:", error.message);
        res.status(500).json({ error: "Failed to fetch queries." });
    }
};



exports.getQueryById = async (req, res) => {
    try {
        const { id } = req.params; // URL'deki ID'yi al
        if (!id) {
            return res.status(400).json({ error: "Query ID is required." });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT query FROM queries WHERE id = @id");

        if (!result.recordset.length) {
            return res.status(404).json({ error: "Query not found." });
        }

        res.status(200).json(result.recordset[0]); // Query'yi döndür
    } catch (error) {
        console.error("Error fetching query by ID:", error.message);
        res.status(500).json({ error: "Failed to fetch query by ID." });
    }
};
