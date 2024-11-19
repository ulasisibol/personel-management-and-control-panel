require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sql, connectDB } = require('../config/dbConfig');

const hashAndUpdatePassword = async () => {
    try {
        // Veritabanına bağlan
        await connectDB();

        // Hashleme işlemi
        const plainPassword = 'your_actual_password'; // Şu anki düz metin şifrenizi buraya yazın
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Şifreyi veritabanında güncelleme
        const request = new sql.Request();
        await request
            .input('username', sql.VarChar, 'admin')
            .input('password', sql.VarChar, hashedPassword)
            .query('UPDATE users SET password = @password WHERE username = @username');

        console.log('Şifre başarıyla hashlenerek güncellendi');
    } catch (err) {
        console.error('Şifre güncelleme sırasında hata:', err);
    }
};

// Fonksiyonu çalıştır
hashAndUpdatePassword();
