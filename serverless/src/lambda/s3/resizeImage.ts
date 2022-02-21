import { SNSHandler, SNSEvent, S3Event } from 'aws-lambda';
import 'source-map-support/register'
import * as AWS from 'aws-sdk';
import Jimp from 'jimp/es'

// Buckets
const s3 = new AWS.S3();
const IMAGES_BUCKET: string = process.env.IMAGES_S3_BUCKET!;
const THUMBNAILS_BUCKET: string = process.env.THUMBNAILS_S3_BUCKET!;
// Images table
const IMAGES_ID_INDEX: string = process.env.IMAGES_ID_INDEX!;
const IMAGES_TABLE: string = process.env.IMAGES_TABLE!;
const docClient = new AWS.DynamoDB.DocumentClient();


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
    const s3Event: S3Event = JSON.parse(snsRecord.Sns.Message);
    console.log('Processing S3 event: ', s3Event);
    for (const record of s3Event.Records) {
      await resizeImage(record.s3.object.key); 
      // Retrieves current item
      const currentItem = await docClient.query({
        TableName: IMAGES_TABLE,
        IndexName: IMAGES_ID_INDEX,
        KeyConditionExpression: 'imageId = :imageId',
        ExpressionAttributeValues: {
          ':imageId': record.s3.object.key
        }
      }).promise();
      console.log('Current item: ', currentItem);
      if (currentItem.Items) {
        // Updates table
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
          TableName: IMAGES_TABLE,
          Key: { 
            "groupId": currentItem.Items[0].groupId,
            "timestamp": currentItem.Items[0].timestamp
          },
          UpdateExpression: 'SET thumbnail = :s',
          ExpressionAttributeValues: {
              ":s": `https://udagram-thumbnails-ibernal-dev.s3.amazonaws.com/${record.s3.object.key}`,
          },
          ReturnValues: "ALL_NEW"
        };
        console.log('Update images table: ', params);
        try {
          const data = await docClient.update(params);
          console.log('Updated image item: ', data);
        } catch (error) {
          console.log('Error updating: ', error);
        }
      }
    }
  }
}

/**
 * Resize the image related to this s3 event and puts the thumbnail in a different bucket
 * @param key S3 Image key
 */
async function resizeImage(key: string) {
  // Download image from bucket
  const response = await s3.getObject({
    Bucket: IMAGES_BUCKET,
    Key: key
  }).promise()
  console.log('S3 original item: ', response);
  // Resize image with JIMP
  const body = response.Body!;
  const image = await Jimp.read(body)
  image.resize(150, Jimp.AUTO)
  const convertedBuffer = await image.getBufferAsync(Jimp.AUTO)
  // Put image in thumbnails bucket
  await s3.putObject({
    Bucket: THUMBNAILS_BUCKET,
    Key: `${key}`,
    ContentType: response.ContentType,
    Body: convertedBuffer
  }).promise()
}