const axios = require('axios');

const analyzeDocumentWithOpenAI = async (text) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a document analysis assistant. Extract key information from the document text and format it as JSON with the following fields: type (Incoming/Outgoing), date, reference, from, to, subject, additionalReference, and summary."
          },
          {
            role: "user",
            content: `Please analyze this document text and extract the key information: ${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data.choices[0].message.content;
    return JSON.parse(result);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to analyze document with OpenAI');
  }
};

module.exports = {
  analyzeDocumentWithOpenAI
};
