const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) { 
    const authHeader = req.headers.authorization

    console.log(authHeader)

    if (!authHeader) { 
        console.log('No token')
        console.log(authHeader)
        return res.status(401).json({ ok: false, message: 'No token' })
    }

    console.log('yes token')

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
