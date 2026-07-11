const bcrypt = require("bcrypt")
const AuthDao = require("../dao/authDao")
const jwt = require("jsonwebtoken")

function generateJwtToken (user) {
    const payload = {
        id: user.id,
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET)

    return token
}

class AuthService {
    static #handleDbError (error) {
        const foundDuplicates = error.code === "23505"

        if (!foundDuplicates) {
            return { status: 500, ok: false, message: "Server Error" }
        }

        switch (error.constraint) {
            case "users_email_key": {
                return {
                    status: 401,
                    ok: false,
                    message: "Email has already been used for registration",
                }
            }
            case "users_username_unique":
            case "users_username_key": {
                return {
                    status: 401,
                    ok: false,
                    message: "Username is already taken",
                }
            }
            default:
                return { status: 500, ok: false, message: "Server Error" }
        }
    }

    static async registerUser (email, username, password) {
        try {
            const saltRounds = 10
            const passwordHash = await bcrypt.hash(password, saltRounds)
            console.log9('SERVICE 2')

            const userId = await AuthDao.createUser(email, username, passwordHash)
            console.log9('SERVICE 3')

            const jwtToken = generateJwtToken({ id: userId })
            console.log9('SERVICE 4')

            return {
                status: 200,
                ok: true,
                token: jwtToken,
                user: {
                    id: userId
                },
            }
        } catch (error) {
            console.log(error)
            return this.#handleDbError(error)
        }
    }

    static async loginUserByUsername (username, password) {
        try {
            const user = await AuthDao.getUserByUsername(username)

            if (!user)
                // user not found
                return { status: 404, ok: false, message: "User not found" }

            const isValid = await bcrypt.compare(password, user.password_hash)

            if (!isValid) return { status: 401, ok: false, message: "Invalid password" }

            const jwtToken = generateJwtToken({ id: user.id })

            return {
                status: 200,
                ok: true,
                token: jwtToken,
                user: {
                    id: user.id,
                },
            }
        } catch (error) {
            console.error(error)
            return { status: 500, ok: false, message: "Server Error" }
        }
    }

    static async loginUserByEmail (email, password) {
        try {
            const user = await AuthDao.getUserByEmail(email)

            if (!user)
                // user not found
                return { status: 404, ok: false, message: "User not found" }

            const isValid = await bcrypt.compare(password, user.password_hash)

            if (!isValid) return { status: 401, ok: false, message: "Invalid password" }

            const jwtToken = generateJwtToken({ id: user.id })

            return {
                status: 200,
                ok: true,
                token: jwtToken,
                user: {
                    id: user.id,
                },
            }
        } catch (error) {
            console.error(error)
            return { status: 500, ok: false, message: "Server Error" }
        }
    }
}

module.exports = AuthService
