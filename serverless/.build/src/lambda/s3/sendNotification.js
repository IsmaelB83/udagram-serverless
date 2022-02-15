import 'source-map-support/register';
import * as AWS from 'aws-sdk';
const DOC_CLIENT = new AWS.DynamoDB.DocumentClient();
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || '';
const STAGE = process.env.STAGE;
const API_ID = process.env.API_ID;
const CONNECTION_PARAMS = {
    apiVersion: "2018-11-29",
    endpoint: `${API_ID}.execute-api.us-east-1.amazonaws.com/${STAGE}`
};
const API_GATEWAY = new AWS.ApiGatewayManagementApi(CONNECTION_PARAMS);
export const handler = async (event) => {
    for (const record of event.Records) {
        const key = record.s3.object.key;
        console.log('Processing S3 item with key: ', key);
        const connections = await DOC_CLIENT.scan({
            TableName: CONNECTIONS_TABLE
        }).promise();
        if (connections.Items) {
            const payload = {
                imageId: key
            };
            for (const connection of connections.Items) {
                const connectionId = connection.id;
                await sendMessageToClient(connectionId, payload);
            }
        }
    }
};
async function sendMessageToClient(connectionId, payload) {
    try {
        console.log('Sending message to a connection: ', connectionId);
        await API_GATEWAY.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(payload)
        }).promise();
    }
    catch (error) {
        console.log('Failed to send the message: ', error);
        if (error.statusCode === 410) {
            console.log('Stale connection');
            await DOC_CLIENT.delete({
                TableName: CONNECTIONS_TABLE,
                Key: {
                    id: connectionId
                }
            });
        }
    }
}
//# sourceMappingURL=sendNotification.js.map