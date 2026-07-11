const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) { 
    const authHeader = req.headers.authorization

    if (!authHeader) { 
        return res.status(401).json({ ok: false, message: 'No token' })
    }

    const token = authHeader.split(' ')[1]

    try { 
        const user = jwt.verify(token, process.env.JWT_SECRET)
        req.user = user
        next()
    } catch (e) {
        return res.status(401).json({ok: false, message: 'Invalid token'})
    }
}

function optionalMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next();
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {}

    next();
}

module.exports = {
    authMiddleware,
    optionalMiddleware
}
