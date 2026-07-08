const ProfileService = require('../services/profileService');
const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const { s3, deleteObjectFromS3Bucket } = require('../services/s3');

const sqs = new SQSClient({ region: process.env.AWS_REGION });

async function handleMessage(message) {
    const body = JSON.parse(message.Body);

    const record = body.Records?.[0]

    if (!record) return

    const key = record.s3.object.key;

    // Extract userId from the S3 object key
    const userId = key.split('/')[1];

    if (!userId) {
        console.error('User ID not found in S3 object key:', key);
        return;
    }

    try {
        const result = await ProfileService.updateAvatar(userId, key);

        if (!result.ok) { 
            console.error(`Failed to update avatar for user ${userId}. Old key: ${result.oldKey}`);
        }

        const oldKey = result.oldKey;

        if (oldKey) {
            // Delete the old avatar from S3
            await deleteObjectFromS3Bucket(oldKey);
        }

    } catch (error) {
        console.error(`Error updating avatar for user ${userId}:`, error);
    }
}

async function poll() { 
    while (true) {
        const res = await sqs.send(new ReceiveMessageCommand({
            QueueUrl: process.env.SQS_AVATAR_QUEUE_URL,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20
        }))

        if (!res.Messages || res.Messages.length === 0) continue;

        for (const message of res.Messages) {
            await handleMessage(message);

            await sqs.send(new DeleteMessageCommand({
                QueueUrl: process.env.SQS_AVATAR_QUEUE_URL,
                ReceiptHandle: message.ReceiptHandle
            }));
        }
    }
}

poll()