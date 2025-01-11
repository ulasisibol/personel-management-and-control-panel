const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({
                message: 'Yetkilendirme başarısız: Token bulunamadı.'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Token'dan gelen verileri request'e ekle
        req.user = {
            userId: decoded.userId,
            isSuperUser: decoded.isSuperUser,
            departmentId: decoded.departmentId
        };

        next();
    } catch (err) {
        console.error('Token doğrulama hatası:', err.message);
        return res.status(403).json({ message: 'Yetkilendirme başarısız: Geçersiz token.' });
    }
};
const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: 'Yetkilendirme başarısız',
                error: 'Kullanıcı bilgisi bulunamadı'
            });
        }

        if (!req.user.isSuperUser) {
            return res.status(403).json({
                message: 'Erişim reddedildi',
                error: 'Bu işlem için admin yetkisi gerekiyor'
            });
        }

        next();
    } catch (err) {
        console.error('Admin kontrolü sırasında hata:', err);
        return res.status(500).json({
            message: 'Sunucu hatası',
            error: err.message
        });
    }
};

module.exports = {
    verifyToken,
    isAdmin
};
