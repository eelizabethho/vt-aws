require('dotenv').config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  DynamoDBDocumentClient, 
  PutCommand 
} = require('@aws-sdk/lib-dynamodb');
const {
  CreateTableCommand,
  DescribeTableCommand,
  ListTablesCommand
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

const db = DynamoDBDocumentClient.from(client);

async function initializeDynamoDB() {
  try {
    console.log('🔍 Checking DynamoDB connection...');
    
    // List existing tables
    const listResult = await client.send(new ListTablesCommand({}));
    console.log('✅ Connected to DynamoDB');
    console.log('📋 Existing tables:', listResult.TableNames.length > 0 ? listResult.TableNames.join(', ') : 'None');

    const tableName = 'schedules';

    // Check if table exists
    try {
      await client.send(new DescribeTableCommand({ TableName: tableName }));
      console.log(`✅ Table "${tableName}" already exists`);
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        console.log(`📦 Creating table "${tableName}"...`);
        
        await client.send(new CreateTableCommand({
          TableName: tableName,
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' }
          ],
          BillingMode: 'PAY_PER_REQUEST'
        }));

        console.log('⏳ Waiting for table to be active...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log(`✅ Table "${tableName}" created successfully`);

        // Add sample data
        console.log('📝 Adding sample schedule...');
        await db.send(new PutCommand({
          TableName: tableName,
          Item: {
            id: 'sample-schedule-1',
            userId: 'demo-user',
            name: 'Spring 2026 Schedule',
            courses: ['CS 1044', 'MATH 1226', 'ENGL 1106'],
            createdAt: new Date().toISOString(),
          }
        }));
        console.log('✅ Sample data added');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 DynamoDB initialization complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Update .env with your AWS credentials');
    console.log('2. Run: npm run server');
    console.log('3. In another terminal: npm start');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'CredentialsProviderError') {
      console.log('\n⚠️  AWS credentials not found. Please:');
      console.log('1. Update .env with your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
      console.log('2. Or run this on AWS (EC2/Lambda) with an IAM role');
    }
    process.exit(1);
  }
}

initializeDynamoDB();
