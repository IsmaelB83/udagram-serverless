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
  const key = { id: event.requestContext.connectionId } 
  console.log('Disconnect websockets: ', key);
  // Deletes connection from DB
  await DOC_CLIENT.delete({
      TableName: CONNECTIONS_TABLE,
      Key: key
    }).promise();
  // Response
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      Item: key
    })
  }
}