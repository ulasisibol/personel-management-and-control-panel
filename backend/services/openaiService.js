require('dotenv').config();
const axios = require('axios');

const API_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = process.env.OPENAI_API_KEY;

async function generateSQL(naturalQuery, roleMessage) {
    try {
        const response = await axios.post(
            API_URL,
            {
                model: "gpt-4",
                messages: [
                    { role: "system", content: roleMessage },
                    {
                        role: "user",
                        content: `Convert this natural language query into a plain SQL query without parameters. The result should be in JSON format like this: {"query": "SELECT * FROM table WHERE column = 'value';"}. Natural language query: "${naturalQuery}"`
                    }
                ],
                max_tokens: 200,
                temperature: 0,
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Gelen yanıtı temizleme
        let content = response.data.choices[0].message.content.trim();

        // Kod bloğu işaretçilerini kaldır
        if (content.startsWith('```')) {
            content = content.replace(/```.*\n/g, '').replace(/```/g, '');
        }

        // JSON olarak parse et
        return JSON.parse(content);
    } catch (error) {
        console.error('OpenAI API Error:', error.message);
        throw error;
    }
}

async function generateFriendlyNames(columns) {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const API_KEY = process.env.OPENAI_API_KEY;

    try {
        const prompt = `
You are a data assistant. Convert the following column names into meaningful and user-friendly names:

Columns: ${columns.join(', ')}

Return the result as a JSON array of strings. Example: ["First Name", "Last Name", "Total Salary"]
        `;

        const response = await axios.post(
            API_URL,
            {
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a helpful assistant for improving data presentation." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 200,
                temperature: 0.7,
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Gelen yanıtı temizleme
        let content = response.data.choices[0].message.content.trim();

        // Kod bloğu işaretçilerini kaldır
        if (content.startsWith('```')) {
            content = content.replace(/```.*\n/g, '').replace(/```/g, '');
        }

        // JSON olarak parse et ve kontrol et
        const friendlyNames = JSON.parse(content);
        if (!Array.isArray(friendlyNames)) {
            throw new Error("AI response is not a valid array.");
        }

        return friendlyNames;
    } catch (error) {
        console.error("Error in generateFriendlyNames:", error.message);
        throw error;
    }
}





module.exports = { generateSQL, generateFriendlyNames };
