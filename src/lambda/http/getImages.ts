// Imports 
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import * as AWS from 'aws-sdk';

// Constants
const GROUPS_TABLE: string = process.env.GROUPS_TABLE || '';
const IMAGES_TABLE: string = process.env.IMAGES_TABLE || '';

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
    // Get images and return result
    const images = await getImagesPerGroup(groupId);
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        Items: images
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

/**
 * Get images from an Id group
 * @param groupId Id of the group
 * @returns List of images information
 */
async function getImagesPerGroup (groupId: string) {
  // Query images
  const result = await docClient.query({
    TableName: IMAGES_TABLE,
    KeyConditionExpression: 'groupId = :groupId',
    ExpressionAttributeValues: {
      ':groupId': groupId
    },
    ScanIndexForward: false
  }).promise();
  // Return items
  return result.Items;

}