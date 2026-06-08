import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? 'dummy-openai-key',
});

export default openai;
