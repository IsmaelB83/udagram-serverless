// Imports 
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';

// Constants
const CONNECTIONS_TABLE: string = process.env.CONNECTIONS_TABLE || '';
const DOC_CLIENT = new AWS.DynamoDB.DocumentClient();

// Lamdba
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => { 
  // Init
  const item = {
    id: event.requestContext.connectionId,
    timestamp: new Date().toISOString()
  }
  console.log('Connect websockets: ', item);
  // Persists connection in DB
  await DOC_CLIENT.put({
    TableName: CONNECTIONS_TABLE,
    Item: item
  }).promise();
  // Response
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      Item: item
    })
  }
}