const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// DynamoDB setup
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

// Get item by ID
app.get('/api/items/:tableName/:id', async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const result = await db.send(new GetCommand({
      TableName: tableName,
      Key: { id },
    }));
    res.json(result.Item || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/update item
app.post('/api/items/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    await db.send(new PutCommand({
      TableName: tableName,
      Item: req.body,
    }));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scan all items
app.get('/api/items/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const result = await db.send(new ScanCommand({
      TableName: tableName,
      Limit: limit,
    }));
    res.json(result.Items || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Query items
app.post('/api/query/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const { keyConditionExpression, expressionAttributeValues } = req.body;
    const result = await db.send(new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    }));
    res.json(result.Items || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
