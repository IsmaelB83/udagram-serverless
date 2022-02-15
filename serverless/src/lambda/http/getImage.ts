// Imports 
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import 'source-map-support/register'
import * as AWS from 'aws-sdk';

// Constants
const IMAGES_TABLE: string = process.env.IMAGES_TABLE || '';
const IMAGES_ID_INDEX: string = process.env.IMAGES_ID_INDEX || '';

// Variables
const docClient = new AWS.DynamoDB.DocumentClient();

// Lamdba
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse path parameters
    if (!event.pathParameters) {
      return { 
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'Image id mandatory'
        })
      }
    }
    // Query image
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
      }
    }
    // Return image
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        Item: result.Items[0]
      })
    }
  } catch (err) {
    return { 
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: err
      })
    }
  }
}