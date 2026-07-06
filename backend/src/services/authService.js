const bcrypt = require('bcrypt')
const AuthDao = require('../dao/authDao')
const jwt = require('jsonwebtoken')

function generateJwtToken (user) {
  const payload = {
    userId: user.id
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET)

  return token
}

class AuthService {
  static #handleDbError (error) {
    const foundDuplicates = error.code === '23505'

    if (!foundDuplicates) {
      return { status: 500, ok: false, message: 'Server Error' }
    }

    switch (error.constraint) {
      case 'users_email_key': {
        return {
          status: 200,
          ok: false,
          message: 'Email has already been used for registration'
        }
      }
      case 'users_username_unique':
      case 'users_username_key': {
        return {
          status: 200,
          ok: false,
          message: 'Username is already taken'
        }
      }
      default:
        return { status: 500, ok: false, message: 'Server Error' }
    }
  }

  static async registerUser (email, username, password) {
    try {
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(password, saltRounds)

      const userId = await AuthDao.createUser(email, username, passwordHash)

      const jwtToken = generateJwtToken({ id: userId })

      return {
        status: 200,
        ok: true,
        id: userId,
        token: jwtToken,
        message: 'Registration successful'
      }
    } catch (error) {
      return this.#handleDbError(error)
    }
  }

  static async loginUserByUsername (username, password) {
    try {
      const user = await AuthDao.getUserByUsername(username)

      if (!user)
        // user not found
        return { status: 404, ok: false, message: 'User not found' }

      const isValid = await bcrypt.compare(password, user.password_hash)

      if (!isValid)
        return { status: 401, ok: false, message: 'Invalid password' }

        const jwtToken = generateJwtToken({ userId: user.id })

      return { status: 200, ok: true, token: jwtToken }
    } catch (error) {
      console.error(error)
      return { status: 500, ok: false, message: 'Server Error' }
    }
  }

  static async loginUserByEmail (email, password) {
    try {
      const user = await AuthDao.getUserByEmail(email)

      if (!user)
        // user not found
        return { status: 404, ok: false, message: 'User not found' }

      const isValid = await bcrypt.compare(password, user.password_hash)

      if (!isValid)
        return { status: 401, ok: false, message: 'Invalid password' }

        const jwtToken = generateJwtToken({ userId: user.id })

      return { status: 200, ok: true, token: jwtToken }
    } catch (error) {
      console.error(error)
      return { status: 500, ok: false, message: 'Server Error' }
    }
  }
}

module.exports = AuthService
