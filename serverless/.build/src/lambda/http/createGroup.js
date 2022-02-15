import 'source-map-support/register';
import * as AWS from 'aws-sdk';
const DB_TABLE = process.env.GROUPS_TABLE || '';
const docClient = new AWS.DynamoDB.DocumentClient();
export const handler = async (event, context) => {
    const body = JSON.parse(event.body || '');
    const params = {
        TableName: DB_TABLE,
        Item: {
            id: context.awsRequestId,
            name: body.name,
            description: body.description
        }
    };
    await docClient.put(params).promise();
    return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
            item: params.Item
        })
    };
};
//# sourceMappingURL=createGroup.js.map