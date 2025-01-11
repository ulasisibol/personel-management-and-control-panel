const { generateFriendlyNames } = require('./services/openaiService'); // OpenAI entegrasyonu

// Sütun isimlerini yapay zeka ile dönüştüren yardımcı fonksiyon
async function transformColumnsWithAI(columns) {
    try {
        // OpenAI API'sine sütun isimlerini gönder
        const prompt = `
You are a data assistant. Convert the following column names into meaningful and user-friendly names:

Columns: ${columns.join(', ')}

Return the result as a JSON array of strings. Example: ["First Name", "Last Name", "Total Salary"]
        `;

        const aiResponse = await generateFriendlyNames(prompt);

        // Yanıtı JSON olarak parse et
        const friendlyNames = JSON.parse(aiResponse);

        // Gelen yanıtın doğru formatta olduğunu kontrol et
        if (!Array.isArray(friendlyNames) || friendlyNames.length !== columns.length) {
            throw new Error('AI response does not match the number of columns.');
        }

        return friendlyNames;
    } catch (error) {
        console.error('Error transforming columns with AI:', error.message);
        throw new Error('Failed to transform column names with AI.');
    }
}

// Yapay zeka destekli sonuç dönüştürme fonksiyonu
async function transformResultWithAI(results) {
    if (!Array.isArray(results) || results.length === 0) {
        return { columns: [], data: [] };
    }

    // İlk satırdaki sütun isimlerini al
    const columns = Object.keys(results[0]);

    // Yapay zeka ile sütun isimlerini dönüştür
    const formattedColumns = await transformColumnsWithAI(columns);

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
