require("dotenv").config()

class VideoClient {
    static async getTotalViews (userId) {
        const response = await fetch(
            `${process.env.VIDEO_SERVICE_URL}/api/videos/${userId}/total-views`,
        )

        if (!response.ok) {
            return null
        }

        const data = await response.json()

        console.log(data)

        return data.totalViews
    }

    static async getVideosCount (userId) {
        const response = await fetch(
            `${process.env.VIDEO_SERVICE_URL}/api/videos/${userId}/count`,
        )


        if (!response.ok) {
            return null
        }

        const { videosCount } = await response.json()

        return videosCount
    }
}

module.exports = VideoClient
