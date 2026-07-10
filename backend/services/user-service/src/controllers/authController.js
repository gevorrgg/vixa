const AuthService = require("../services/authService")

function isValidUsername (username) {
    const forbiddenNames = new Set(["admin", "root", "support", "api", "null", "undefined"])

    if (typeof username !== "string") return false

    const value = username.trim().toLowerCase()

    if (value.length < 3 || value.length > 20) return false

    if (forbiddenNames.has(value)) return false

    if (!/^[a-z0-9._]+$/.test(value)) return false

    if (value.includes("..")) return false

    if (value.startsWith(".") || value.endsWith(".")) return false

    if (value.includes("@")) return false

    return true
}

function isValidEmail (email) {
    const emailRegex =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    return emailRegex.test(email)
}

class AuthController {
    static async login (req, res) {
        const { authname, password } = req.body

        let serviceResponse = null

        if (!authname || !password) { 
            return res.status(400).json({ ok: false, message: "Missing credentials" })
        }

        if ( authname.includes("@")) {
            if (!isValidEmail(authname)) {
                return res.status(400).json({ ok: false, message: "Invalid Email" })
            }

            serviceResponse = await AuthService.loginUserByEmail(authname, password)
        } else if (isValidUsername(authname))
            serviceResponse = await AuthService.loginUserByUsername(authname, password)
        else {
            return res.status(400).json({ ok: false, message: "Invalid Username" })
        }

        if (!serviceResponse.ok) {
            return res
                .status(serviceResponse.status)
                .json({ ok: false, message: serviceResponse.message })
        }

        return res.json({
            ok: true,
            message: serviceResponse.message,
            token: serviceResponse.token,
            user: serviceResponse.user
        })
    }

    static async register(req, res) {
        try {
            console.log('register 1')
            const { email, username, password } = req.body

            console.log('register 2')

            if (!username || !isValidUsername(username))
                return res.status(400).json({ ok: false, message: "Invalid Username" })

            console.log('register 3')

            if (!email || !isValidEmail(email))
                return res.status(400).json({ ok: false, message: "Invalid Email" })

            console.log('register 4')

            if (!password) {
                return res.status(400).json({ ok: false, message: "Weak password" })
            }

            console.log('register 5')

            const serviceResponse = await AuthService.registerUser(email, username, password)

            if (!serviceResponse.ok) {
                console.log('register 7')
                return res
                    .status(serviceResponse.status)
                    .json({ ok: false, message: serviceResponse.message })
            }

            console.log('register 6')

            return res.json({
                ok: true,
                message: serviceResponse.message,
                token: serviceResponse.token,
                user: serviceResponse.user
            })
        } catch (error) { 
            console.log('Something happened')
            console.log(error)

            return res.status(500).json({ok: false})
        }
    }

    static async getMe (req, res) {
        if (!req.user) {
            return res.status(401).json({ ok: false, message: "Unauthorized" })
        }

        return res.json(req.user)
    }
}

module.exports = AuthController
