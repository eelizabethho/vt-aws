# Smart Scheduler

## How we used Kiro
We used **Kiro** to help speed up development and connect different parts of our system.

- Integrated **AWS DynamoDB** for storing user schedules  
- Helped build and structure **API routes using Express.js**  
- Assisted with connecting our **Flask API** to retrieve VT class data  
- Helped debug and improve overall data flow between frontend and backend  

---

## How to run the project

### 1. Clone the repository
```bash
git clone <your-repo-link>
cd <your-project-folder>

2. Install dependencies
Frontend
cd client
npm install
Backend (Express)
cd server
npm install
Backend (Flask)
cd flask
pip install -r requirements.txt
3. Set up environment variables

Create a .env file:

REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_ID=your_google_client_id
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
4. Run the app
Start Express backend
cd server
node index.js
Start Flask API
cd flask
python app.py
Start frontend
cd client
npm start
5. Open in browser
http://localhost:3000
