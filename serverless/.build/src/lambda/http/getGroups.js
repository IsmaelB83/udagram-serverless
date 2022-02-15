import 'source-map-support/register';
import * as AWS from 'aws-sdk';
const DB_TABLE = process.env.GROUPS_TABLE || '';
const docClient = new AWS.DynamoDB.DocumentClient();
export const handler = async (event) => {
    try {
        const nextKey = parseNextKeyParameter(event);
        const limit = parseLimitParameter(event) || 10;
        const params = {
            TableName: DB_TABLE,
            Limit: limit,
            ExclusiveStartKey: nextKey
        };
        const result = await docClient.scan(params).promise();
        console.log(result);
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                nextKey: encodeNextKey(result.LastEvaluatedKey),
                Items: result.Items
            })
        };
    }
    catch (err) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                error: err
            })
        };
    }
};
function parseLimitParameter(event) {
    const limitStr = getQueryParameter(event, 'limit');
    if (!limitStr)
        return undefined;
    const limit = parseInt(limitStr, 10);
    if (limit <= 0)
        throw new Error('Limit should be positive');
    return limit;
}
function parseNextKeyParameter(event) {
    const nextKeyStr = getQueryParameter(event, 'nextKey');
    if (!nextKeyStr)
        return undefined;
    const uriDecoded = decodeURIComponent(nextKeyStr);
    return JSON.parse(uriDecoded);
}
function getQueryParameter(event, name) {
    const queryParams = event.queryStringParameters;
    if (!queryParams)
        return undefined;
    return queryParams[name];
}
function encodeNextKey(lastEvaluatedKey) {
    if (!lastEvaluatedKey)
        return null;
    return encodeURIComponent(JSON.stringify(lastEvaluatedKey));
}
//# sourceMappingURL=getGroups.js.map