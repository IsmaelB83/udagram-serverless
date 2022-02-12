// Imports 
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import * as AWS from 'aws-sdk';

// Constants
const GROUPS_TABLE: string = process.env.GROUPS_TABLE || '';
const IMAGES_TABLE: string = process.env.IMAGES_TABLE || '';
const IMAGES_BUCKET: string = process.env.IMAGES_S3_BUCKET || '';
const SIGNED_URL_EXPIRATION: number = parseInt(process.env.SIGNED_URL_EXPIRATION || "300");

// Variables
const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({ signatureVersion: 'v4' });

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
    // Generate image item
    const body = JSON.parse(event.body || '');
    const imageId = context.awsRequestId;
    const item = {
      imageId: imageId,
      timestamp: new Date().toUTCString(),
      groupId: groupId,
      title: body.title,
      url: `https://${IMAGES_BUCKET}.s3.amazonaws.com/${imageId}`
    }
    // Signed url
    const url = await getUploadUrl(imageId);
    // Post images and return result
    await docClient.put({
      TableName: IMAGES_TABLE,
      Item: item
    }).promise();
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        Item: item,
        uploadUrl: url
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

/**
 * Gets a signed url to upload an image to the s3 bucket
 * @param imageId Image id
 */
async function getUploadUrl(imageId: string): Promise<string> {
  const result = await s3.getSignedUrlPromise('putObject', {
    Bucket: IMAGES_BUCKET,
    Key: imageId,
    Expires: SIGNED_URL_EXPIRATION
  })
  return result;
}