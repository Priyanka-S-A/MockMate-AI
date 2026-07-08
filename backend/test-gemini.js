import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load env variables
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not defined in .env file.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Say Hello');
    console.log('Gemini API Response:');
    console.log(result.response.text().trim());
  } catch (error) {
    console.error('Gemini API Error:', error);
  }
}

run();
