import { DynamoDBStreamHandler, DynamoDBStreamEvent } from 'aws-lambda'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'
import 'source-map-support/register'

const ES_ENDPOINT = process.env.ES_ENDPOINT;
const ES = new elasticsearch.Client({
  hosts: [ ES_ENDPOINT ],
  connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing events batch from DynamoDB: ', JSON.stringify(event));
  for (const record of event.Records) {
    console.log('Processing record: ', JSON.stringify(record));   
    
    if (record.eventName !== 'INSERT') {
      continue
    }

    const newItem = record.dynamodb?.NewImage;
    const imageId = newItem?.imageId.S;
    const body = {
      imageId: imageId,
      groupId: newItem?.groupId.S,
      imageUrl: newItem?.imageUrl.S,
      title: newItem?.title.S,
      timestamp: newItem?.timestamp.S
    }

    await ES.index({
      index: 'images-index',
      type: 'images',
      id: imageId,
      body
    })
    
  }
}