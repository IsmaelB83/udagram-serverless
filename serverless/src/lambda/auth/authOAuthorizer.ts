import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, APIGatewayAuthorizerHandler } from 'aws-lambda';
import 'source-map-support/register'
import { verify } from 'jsonwebtoken';
import { JwtToken } from '../../auth/JwtToken';


const AUTH_0_SECRET = process.env.AUTH_0_SECRET;

export const handler: APIGatewayAuthorizerHandler = async function(event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> {
  try {
    const decodedToken = verifyToken(event.authorizationToken);
    console.log('User Authorized: ', event.authorizationToken);
    return {
      principalId: decodedToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (error) {
    console.log('User NOT Authorized: ', error.message);
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string) {
  
  if (!authHeader) 
    throw new Error('No authentication header found');

  if (!authHeader.toLocaleLowerCase().startsWith('bearer ')) 
    throw new Error('Invalid authorization header');

  const split = authHeader.split(' ');
  const token = split[1];
  return verify(token, AUTH_0_SECRET) as JwtToken;
}