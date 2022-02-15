import 'source-map-support/register';
export const handler = async (event) => {
    console.log('Processing events batch from DynamoDB: ', JSON.stringify(event));
    for (const record of event.Records) {
        console.log('Processing record: ', JSON.stringify(record));
    }
};
//# sourceMappingURL=elasticSearchSync.js.map