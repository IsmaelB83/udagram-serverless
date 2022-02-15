import 'source-map-support/register';
import * as AWS from 'aws-sdk';
const GROUPS_TABLE = process.env.GROUPS_TABLE || '';
const IMAGES_TABLE = process.env.IMAGES_TABLE || '';
const docClient = new AWS.DynamoDB.DocumentClient();
export const handler = async (event) => {
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
        const images = await getImagesPerGroup(groupId);
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                Items: images
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
async function getImagesPerGroup(groupId) {
    const result = await docClient.query({
        TableName: IMAGES_TABLE,
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues: {
            ':groupId': groupId
        },
        ScanIndexForward: false
    }).promise();
    return result.Items;
}
//# sourceMappingURL=getImages.js.map