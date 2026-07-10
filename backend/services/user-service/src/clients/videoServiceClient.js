require("dotenv").config()

class VideoClient {
    static async getTotalViews (userId) {
        const response = await fetch(
            `${process.env.VIDEO_SERVICE_URL}/api/users/${userId}/total-views`,
        )

        if (!response.ok) {
            return null
        }

        const data = await response.json()

        return data.totalViews
    }

    static async getVideosCount (userId) {
        const response = await fetch(
            `${process.env.VIDEO_SERVICE_URL}/api/users/${userId}/videos/count`,
        )

        if (!response.ok) {
            return null
        }

        const { videosCount } = await response.json()

        return videosCount
    }
}

module.exports = VideoClient
