// Imports 
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import * as AWS from 'aws-sdk';

// Constants
const GROUPS_TABLE: string = process.env.GROUPS_TABLE || '';
const IMAGES_TABLE: string = process.env.IMAGES_TABLE || '';

// Variables
const docClient = new AWS.DynamoDB.DocumentClient();

// Lamdba
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    // Parse path parameters
    if (!event.pathParameters) {
      return { 
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'Group id mandatory'
        })
      }
    }
    const groupId = event.pathParameters.groupId || '';
    // Check groupId exists
    const validGroupId = await groupExists(groupId);
    if (!validGroupId) {
      return { 
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: `GroupID ${groupId} not found`
        })
      }
    }
    // Post images and return result
    const body = JSON.parse(event.body || '');
    const item = {
      imageId: context.awsRequestId,
      timestamp: new Date().toUTCString(),
      groupId: groupId,
      title: body.title,
      url: body.url
    }
    await docClient.put({
      TableName: IMAGES_TABLE,
      Item: item
    }).promise();
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        Item: item
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

/**
 * Check wether groupId exists or not
 * @param groupId Id of the group
 * @param title Name of the image
 * @param url Url to the image
 * @returns True or False
 */
async function groupExists(groupId: string): Promise<boolean> {
  // Query return table
  const result = await docClient.get({
    TableName: GROUPS_TABLE,
    Key: {
      id: groupId
    }
  }).promise()
  // Return wether groupId exists true or false 
  return !!result.Item;
}