/**
 * PASTE THIS INTO server/index.js
 *
 * Add these lines near the top with your other requires:
 *   const { OAuth2Client } = require('google-auth-library');
 *   const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
 *
 * Then paste the routes below your existing routes.
 *
 * DynamoDB table needed:
 *   Table name:  student-schedules
 *   Partition key:  userId (String)
 */

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware: verify Google token and attach userId to req
async function verifyGoogle(req, res, next) {
  const credential = req.headers['x-google-credential'];
  if (!credential) return res.status(401).json({ error: 'No credential' });
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    req.userId = ticket.getPayload().sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid credential' });
  }
}

// Save a student's schedule
app.post('/api/schedules/:userId', verifyGoogle, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    await db.send(new PutCommand({
      TableName: 'student-schedules',
      Item: req.body,
    }));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Load a student's schedule
app.get('/api/schedules/:userId', verifyGoogle, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    const result = await db.send(new GetCommand({
      TableName: 'student-schedules',
      Key: { userId },
    }));
    res.json(result.Item || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
