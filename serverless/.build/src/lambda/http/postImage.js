import 'source-map-support/register';
import * as AWS from 'aws-sdk';
const GROUPS_TABLE = process.env.GROUPS_TABLE || '';
const IMAGES_TABLE = process.env.IMAGES_TABLE || '';
const IMAGES_BUCKET = process.env.IMAGES_S3_BUCKET || '';
const SIGNED_URL_EXPIRATION = parseInt(process.env.SIGNED_URL_EXPIRATION || "300");
const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({ signatureVersion: 'v4' });
export const handler = async (event, context) => {
    try {
        if (!event.pathParameters) {
            return {
                statusCode: 500,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    error: 'Group id mandatory'
                })
            };
        }
        const groupId = event.pathParameters.groupId || '';
        const validGroupId = await groupExists(groupId);
        if (!validGroupId) {
            return {
                statusCode: 404,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    error: `GroupID ${groupId} not found`
                })
            };
        }
        const body = JSON.parse(event.body || '');
        const imageId = context.awsRequestId;
        const item = {
            imageId: imageId,
            timestamp: new Date().toUTCString(),
            groupId: groupId,
            title: body.title,
            url: `https://${IMAGES_BUCKET}.s3.amazonaws.com/${imageId}`
        };
        const url = await getUploadUrl(imageId);
        await docClient.put({
            TableName: IMAGES_TABLE,
            Item: item
        }).promise();
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                Item: item,
                uploadUrl: url
            })
        };
    }
    catch (err) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                error: err
            })
        };
    }
};
async function groupExists(groupId) {
    const result = await docClient.get({
        TableName: GROUPS_TABLE,
        Key: {
            id: groupId
        }
    }).promise();
    return !!result.Item;
}
async function getUploadUrl(imageId) {
    const result = await s3.getSignedUrlPromise('putObject', {
        Bucket: IMAGES_BUCKET,
        Key: imageId,
        Expires: SIGNED_URL_EXPIRATION
    });
    return result;
}
//# sourceMappingURL=postImage.js.map