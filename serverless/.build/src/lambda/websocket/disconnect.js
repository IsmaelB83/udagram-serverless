import 'source-map-support/register';
import * as AWS from 'aws-sdk';
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || '';
const DOC_CLIENT = new AWS.DynamoDB.DocumentClient();
export const handler = async (event, context) => {
    const key = { id: event.requestContext.connectionId };
    console.log('Disconnect websockets: ', key);
    await DOC_CLIENT.delete({
        TableName: CONNECTIONS_TABLE,
        Key: key
    }).promise();
    return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
            Item: key
        })
    };
};
//# sourceMappingURL=disconnect.js.map