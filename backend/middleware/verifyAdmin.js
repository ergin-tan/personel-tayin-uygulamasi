const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Yetkilendirme hatası: Oturum açmanız gerekiyor.' });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Yetkilendirme hatası: Bu işlem için admin yetkisi gerekiyor.' });
  }
  next();
};

module.exports = verifyAdmin;