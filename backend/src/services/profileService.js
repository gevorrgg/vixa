const pool = require('../dao/db')
const ProfileDao = require('../dao/profileDao')
const UserService = require('../services/userService')
const { v4 } = require('uuid')
const { s3 } = require('./s3')
const { PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

function isValidUsername (username) {
    const forbiddenNames = new Set([
        'admin',
        'root',
        'support',
        'api',
        'null',
        'undefined'
    ])

    if (typeof username !== 'string') return false

    const value = username.trim().toLowerCase()

    if (value.length < 3 || value.length > 20) return false

    if (forbiddenNames.has(value)) return false

    if (!/^[a-z0-9._]+$/.test(value)) return false

    if (value.includes('..')) return false

    if (value.startsWith('.') || value.endsWith('.')) return false

    if (value.includes('@')) return false

    return true
}

class ProfileService {
    #queryBuilder = new QueryBuilder(fieldMap)

    static async createUserProfile (userId, profile) {
        const profileData = {
            ...profile,
            userId
        }

        await ProfileDao.create(profileData)
    }

    static async updateUserProfile (userId, newProfile) {
        await ProfileDao.update(newProfile, userId)
    }

    static async getAvatarUploadUrl (userId, fileType) {
        const extMap = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/gif': 'gif'
        }

        const ext = extMap[fileType] || 'bin'

        const key = `avatars/${userId}/${v4()}.${ext}`

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: key
        })

        const uploadUrl = await getSignedUrl(s3, command, {
            expiresIn: 3600,
         })

        return { uploadUrl, key }
    }

    static async updateProfile (userId, body) {
        if ('username' in body) {
            const result = await UserService.updateUsername(
                userId,
                body.username
            )

            if (!result.ok) {
                return result
            }

            delete body.username
        }

        const hasProfile = await this.hasUserProfile(userId)

        if (!hasProfile) {
            await this.createUserProfile(userId, body)
        } else {
            await this.updateUserProfile(userId, body)
        }

        return { ok: true }
    }

    static async updateAvatar (userId, newKey) {
        const oldKey = await ProfileDao.getAvatarKey(userId)

        if (oldKey === newKey) {
            return { ok: true, oldKey: null }
        }

        try {
            await ProfileDao.updateAvatarKey(userId, newKey)
        } catch (error) {
            console.error(
                `Error updating avatar key for user ${userId}:`,
                error
            )
            return { ok: false, oldKey }
        }

        return { ok: true, oldKey }
    }

    static async hasUserProfile (userId) {
        const hasProfile = await ProfileDao.hasUserProfile(userId)

        return hasProfile
    }
}

module.exports = ProfileService
