const VideoDao = require("../dao/videoDao")
const { v4 } = require("uuid")
const { s3, deleteObjectFromS3Bucket } = require("./s3")
const { PutObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")

class VideoService {
    static async getUserVideos (userId) {
        const dbVideos = await VideoDao.getUserVideos(userId)

        let videos = []

        for (const elem of dbVideos) {
            const contentUrl = elem.content_key
                ? `https://${process.env.CLOUD_FRONT_DOMAIN}/${elem.content_key}`
                : null
            const thumbnailUrl = elem.thumbnail_key
                ? `https://${process.env.CLOUD_FRONT_DOMAIN}/${elem.thumbnail_key}`
                : null

            videos.push({
                id: elem.id,
                userId: elem.user_id,
                title: elem.title,
                description: elem.description,
                contentUrl: contentUrl,
                date: elem.created_at,
                thumbnailUrl: thumbnailUrl,
                duration: elem.duration,
            })
        }

        return videos
    }

    static async createVideo (userId, video) {
        try {
            await VideoDao.createVideo(userId, video)
        } catch (error) {
            return { ok: false, message: "Failed to upload video" }
        }

        return { ok: true, message: "Successfully uploaded video" }
    }

    static async getVideosCount (userId) {
        const videosCount = await VideoDao.getVideosCount(userId)

        return videosCount
    }

    static async getContentUploadUrl (userId, fileType) {
        const extMap = {
            "video/mp4": "mp4",
            "video/webm": "webm",
            "video/ogg": "ogg",
        }

        const ext = extMap[fileType] || "bin"
        const key = `videos/${userId}/content/${v4()}.${ext}`

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: key,
        })

        const uploadUrl = await getSignedUrl(s3, command, {
            expiresIn: 3600,
        })

        return { uploadUrl, key }
    }

    static async getThumbnailUploadUrl (userId, fileType) {
        const extMap = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
            "image/gif": "gif",
        }

        const ext = extMap[fileType] || "bin"
        const key = `videos/${userId}/thumbnails/${v4()}.${ext}`

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: key,
        })

        const uploadUrl = await getSignedUrl(s3, command, {
            expiresIn: 3600,
        })

        return { uploadUrl, key }
    }

    static async deleteVideo (videoId, userId) {
        const deletedVideo = await VideoDao.deleteVideoById(videoId, userId)

        if (!deletedVideo) {
            return { ok: false }
        }

        const { contentKey, thumbnailKey } = deletedVideo

        deleteObjectFromS3Bucket(contentKey)
        deleteObjectFromS3Bucket(thumbnailKey)

        return { ok: true }
    }

    static async likeStatus (videoId, userId) {
        const likeStatus = await VideoDao.isVideoLikedByUser(videoId, userId)

        return { ok: true, isLiked: likeStatus }
    }

    static async likeVideo (videoId, userId) {
        try {
            const liked = await VideoDao.likeVideo(videoId, userId)

            if (!liked) {
                return {
                    status: 409,
                    ok: false,
                    message: "Video already liked",
                }
            }

            return {
                status: 201,
                ok: true,
            }
        } catch (error) {
            console.error(error)

            return {
                status: 500,
                ok: false,
                message: "Server error",
            }
        }
    }

    static async removeLike (videoId, userId) {
        try {
            const likeStatus = await VideoDao.deleteLike(videoId, userId)

            if (!likeStatus) {
                return {
                    status: 404,
                    ok: false,
                    message: "Video is not liked by user",
                }
            }

            return {
                status: 200,
                ok: true,
            }
        } catch (error) {
            console.error(error)

            return {
                status: 500,
                ok: false,
                message: "Server error",
            }
        }
    }
}

module.exports = VideoService
