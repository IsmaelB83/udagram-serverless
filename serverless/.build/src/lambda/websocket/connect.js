import 'source-map-support/register';
import * as AWS from 'aws-sdk';
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || '';
const DOC_CLIENT = new AWS.DynamoDB.DocumentClient();
export const handler = async (event, context) => {
    const item = {
        id: event.requestContext.connectionId,
        timestamp: new Date().toISOString()
    };
    console.log('Connect websockets: ', item);
    await DOC_CLIENT.put({
        TableName: CONNECTIONS_TABLE,
        Item: item
    }).promise();
    return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
            Item: item
        })
    };
};
//# sourceMappingURL=connect.js.map