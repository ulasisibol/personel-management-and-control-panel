const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Yetkilendirme başarısız',
                error: 'Token bulunamadı'
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Token'dan çözülen bilgileri request'e ekle
            next();
        } catch (err) {
            return res.status(401).json({
                message: 'Yetkilendirme başarısız',
                error: 'Geçersiz token'
            });
        }
    } catch (err) {
        console.error('Token doğrulama hatası:', err);
        return res.status(500).json({
            message: 'Sunucu hatası',
            error: err.message
        });
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
