const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, getConnection } = require('../config/dbConfig');

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .query(`
                SELECT id, username, password, is_super_user 
                FROM users 
                WHERE username = @username
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }

        const user = result.recordset[0];
        console.log('Database user data:', user);

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }

        const isSuperUser = Boolean(user.is_super_user);
        console.log('is_super_user value:', user.is_super_user);
        console.log('Converted isSuperUser:', isSuperUser);

        const token = jwt.sign(
            { userId: user.id, isSuperUser: isSuperUser },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                isSuperUser: isSuperUser
            },
            message: 'Giriş başarılı'
        });

    } catch (err) {
        console.error('Login hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

const addUser = async (req, res) => {
    const { username, password, isSuperUser } = req.body;
    let transaction;

    try {
        const pool = await getConnection();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await new sql.Request(transaction)
            .input('username', sql.VarChar(50), username)
            .input('password', sql.VarChar(255), hashedPassword)
            .input('isSuperUser', sql.Bit, isSuperUser ? 1 : 0)
            .query(`
                INSERT INTO users (username, password, is_super_user, created_at) 
                OUTPUT INSERTED.id, INSERTED.username, INSERTED.is_super_user
                VALUES (@username, @password, @isSuperUser, GETDATE());
            `);

        await transaction.commit();

        res.status(201).json({
            message: 'Kullanıcı başarıyla oluşturuldu',
            user: result.recordset[0]
        });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Kullanıcı oluşturma hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

module.exports = {
    loginUser,
    addUser
};
