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
        console.log("Empty results");
        return { columns: [], data: [] };
    }

    // İlk satırdaki sütun isimlerini al
    const columns = Object.keys(results[0]);
    console.log("Original Columns:", columns);

    // Sütun isimlerini yapay zeka ile dönüştür
    let formattedColumns;
    try {
        formattedColumns = await generateFriendlyNames(columns);
        console.log("Formatted Columns from AI:", formattedColumns);
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

    console.log("Transformed Data:", data);
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

        console.log('Executing Query:', query);

        // Veritabanı bağlantısını al
        const pool = await getConnection();

        // SQL sorgusunu çalıştır
        const result = await pool.request().query(query);
        console.log("Raw Query Result:", result.recordset);

        // Sonuçları yapay zeka destekli olarak dönüştür
        const transformedResult = await transformResultWithAI(result.recordset);
        console.log("AI Transformed Result:", transformedResult);

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
