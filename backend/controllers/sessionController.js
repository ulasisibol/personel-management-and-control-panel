const { sql } = require('../config/dbConfig');
const bcrypt = require('bcryptjs');

const addSession = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Gelen istek:', { username, password }); // Debug için

        // Kullanıcıyı kontrol et
        const request = new sql.Request();
        const userResult = await request
            .input('username', sql.VarChar, username)
            .query('SELECT id, password FROM users WHERE username = @username');

        if (userResult.recordset.length === 0) {
            console.log('Kullanıcı bulunamadı:', username);
            return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
        }

        const user = userResult.recordset[0];
        
        // Şifreyi kontrol et
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('Şifre eşleşmedi');
            return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
        }

        // Oturum oluştur
        const sessionRequest = new sql.Request();
        await sessionRequest
            .input('user_id', sql.Int, user.id)
            .input('login_time', sql.DateTime, new Date())
            .query('INSERT INTO sessions (user_id, login_time) VALUES (@user_id, @login_time)');

        res.status(200).json({ 
            message: 'Giriş başarılı',
            userId: user.id
        });

    } catch (err) {
        console.error('Oturum eklenirken hata:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

module.exports = {
    addSession
};