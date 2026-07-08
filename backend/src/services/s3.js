const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED"
});

async function deleteObjectFromS3Bucket(key) {
    return s3.send(
        new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: key
        })
    );
}

module.exports = {
    s3,
    deleteObjectFromS3Bucket
};