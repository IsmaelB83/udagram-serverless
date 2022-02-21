import { SNSHandler, SNSEvent, S3Event } from 'aws-lambda';
import 'source-map-support/register'
import * as AWS from 'aws-sdk';

const DOC_CLIENT = new AWS.DynamoDB.DocumentClient();
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE!;
const STAGE = process.env.STAGE;
const API_ID = process.env.API_ID;

const CONNECTION_PARAMS = {
  apiVersion: "2018-11-29",
  endpoint:  `${API_ID}.execute-api.us-east-1.amazonaws.com/${STAGE}`
}

const API_GATEWAY = new AWS.ApiGatewayManagementApi(CONNECTION_PARAMS);

/**
 * Process SNS Event
 * @param event SNS Event received
 */
export const handler: SNSHandler = async (event: SNSEvent) => {
  // Iterate trhough each sns record received in the event
  for (const snsRecord of event.Records) {
    // Log
    console.log('Processing SNS Record: ', snsRecord);
    // The message receive in the SNS Event is an S3Event
    const s3Event = JSON.parse(snsRecord.Sns.Message);
    await processS3Event(s3Event);
  }
}

/**
 * Process S3 events received in the SNS Event
 * @param event S3 Event trigger by the bucket
 */
async function processS3Event (event: S3Event) {
  // Log
  console.log('Processing S3 event: ', event);
  // Read current wss connections
  const connections = await DOC_CLIENT.scan({
    TableName: CONNECTIONS_TABLE
  }).promise();
  // If there are connections
  if (connections.Items) {
    // S3 Event could have more than one record
    for (const record of event.Records) {
      for (const connection of connections.Items) {
        const connectionId = connection.id;
        await sendMessageToClient(connectionId, { imageId: record.s3.object.key });         
      } 
    }
  }
}

/**
 * Send message to a connected client
 * @param connectionId WSS Connection id
 * @param payload Message to send
 */
async function sendMessageToClient(connectionId: string, payload: any) {
  try {
    // Post message to the wss connection
    console.log('Sending message to a connection: ', connectionId);
    await API_GATEWAY.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(payload)
    }).promise();
  } catch (error) {
    // If there is an exception deletes connectionId from DynamoDB
    console.log('Failed to send the message: ', error)
    if (error.statusCode === 410) {
      console.log('Stale connection');
      await DOC_CLIENT.delete({
        TableName: CONNECTIONS_TABLE,
        Key: { id: connectionId }
      });
    }
  }
}