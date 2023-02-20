import boto3
# Get the service resource.
import key_config as keys

dynamodb = boto3.resource('dynamodb',
                    aws_access_key_id=keys.ACCESS_KEY_ID,
                    aws_secret_access_key=keys.ACCESS_SECRET_KEY,

table = dynamodb.create_table(
{
    "TableName": "Credentials",
    "KeySchema": [
      { "AttributeName": "Email", "KeyType": "HASH" },
    ],
    "AttributeDefinitions": [
      { "AttributeName": "Email", "AttributeType": "S" },
    ],
    "ProvisionedThroughput": {
      "ReadCapacityUnits": 5,
      "WriteCapacityUnits": 5
    }
}
)

table.meta.client.get_waiter('table_exists).wait(TableName='Credentials')