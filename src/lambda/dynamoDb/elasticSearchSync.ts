import { DynamoDBStreamHandler, DynamoDBStreamEvent } from 'aws-lambda'

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing events batch from DynamoDB: ', JSON.stringify(event));
  for (const record of event.Records) {
    console.log('Processing record: ', JSON.stringify(record));    
  }
}