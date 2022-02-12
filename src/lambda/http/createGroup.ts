// Imports 
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import * as AWS from 'aws-sdk';

// Constants
const DB_TABLE: string = process.env.GROUPS_TABLE || '';

// Variables
const docClient = new AWS.DynamoDB.DocumentClient();

// Lamdba
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

  const body = JSON.parse(event.body || '');

  const params = {
    TableName: DB_TABLE,
    Item: {
      id: context.awsRequestId,
      name:   body.name,
      description: body.description
    }
  }
  
  await docClient.put(params).promise()
  
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      item: params.Item
    })
  }
}