require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sql, connectDB } = require('../config/dbConfig');

const testPasswordCompare = async () => {
    try {
        // Veritabanına bağlan
        await connectDB();

        // Veritabanındaki admin kullanıcısını bul
        const request = new sql.Request();
        const result = await request
            .input('username', sql.VarChar, 'admin')
            .query('SELECT password FROM users WHERE username = @username');

        if (result.recordset.length === 0) {
            console.log('Kullanıcı bulunamadı');
            return;
        }

        const hashedPassword = result.recordset[0].password;
        const plainPassword = 'your_actual_password'; // Test etmek istediğiniz düz metin şifreyi buraya yazın

        // Şifre karşılaştırma
        const isPasswordValid = await bcrypt.compare(plainPassword, hashedPassword);

        if (isPasswordValid) {
            console.log('Şifre doğru!');
        } else {
            console.log('Geçersiz şifre.');
        }
    } catch (err) {
        console.error('Karşılaştırma hatası:', err);
    }
};

// Fonksiyonu çalıştır
testPasswordCompare();
