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

module.exports = {
    authMiddleware
}
