import 'source-map-support/register';
import * as AWS from 'aws-sdk';
const IMAGES_TABLE = process.env.IMAGES_TABLE || '';
const IMAGES_ID_INDEX = process.env.IMAGES_ID_INDEX || '';
const docClient = new AWS.DynamoDB.DocumentClient();
export const handler = async (event) => {
    try {
        if (!event.pathParameters) {
            return {
                statusCode: 500,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    error: 'Image id mandatory'
                })
            };
        }
        const imageId = event.pathParameters.imageId || '';
        const result = await docClient.query({
            TableName: IMAGES_TABLE,
            IndexName: IMAGES_ID_INDEX,
            KeyConditionExpression: 'imageId = :imageId',
            ExpressionAttributeValues: {
                ':imageId': imageId
            }
        }).promise();
        if (!result.Count || !result.Items) {
            return {
                statusCode: 404,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    error: `ImageId ${imageId} not found`
                })
            };
        }
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                Item: result.Items[0]
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
//# sourceMappingURL=getImage.js.map