require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function main() {
  const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name).join('\n'));
  } catch (err) {
    console.error(err);
  }
}
main();
