const Groq = require('groq-sdk');

const LINK_PROMPT = (content) => `You are a knowledge management assistant. Analyze the following text and return ONLY valid JSON with no markdown, no explanation, nothing outside the JSON.

Text:
"""
${content.slice(0, 28000)}
"""

Return this exact JSON:
{
  "title": "clean concise title under 80 chars that captures the essence of the content with caps and no special formatting",
  "summary": "2-4 sentences capturing the core idea and why it matters",
  "key_points": ["up to 6 short bullet points of key takeaways"],
  "tags": ["up to 8 lowercase tags representing the overall topic, domain, and type of content — not specific details, names, or inner facts. E.g. for a resume: ['resume', 'career', 'software-engineering']. For a research paper on neural nets: ['machine-learning', 'research', 'deep-learning']. Use hyphens for multi-word tags."],
  "category": "one of: article | tutorial | video | recipe | paper | tool | inspiration | other",
  "reading_time_minutes": <integer>
}`;

const NOTE_PROMPT = (content) => `Analyze this note and return ONLY valid JSON with no markdown:

"""
${content.slice(0, 8000)}
"""

{
  "title": "short descriptive title",
  "summary": "one sentence summary",
  "tags": ["up to 6 lowercase tags representing the whole content and type of the note — not specific details. Use hyphens for multi-word tags. Overall what it is"]
}`;

const IMAGE_PROMPT = () => `Describe this image concisely, then return ONLY valid JSON:
{
  "title": "what this image shows in under 60 chars",
  "summary": "1-2 sentence description",
  "tags": ["up to 8 relevant tags"]
}`;

async function runGroqPrompt({ apiKey, model = 'llama-3.3-70b-versatile', prompt }) {
  try {
    const client = new Groq({ apiKey });
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const raw = response.choices[0]?.message?.content || '{}';

    // Extract JSON safely — model sometimes wraps in ```json
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Groq response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('[groq] API call failed:', err.message);
    throw err;
  }
}

async function processLink({ apiKey, model, content, title }) {
  const prompt = LINK_PROMPT(content || title || '');
  return runGroqPrompt({ apiKey, model, prompt });
}

async function processNote({ apiKey, model, content }) {
  const prompt = NOTE_PROMPT(content);
  return runGroqPrompt({ apiKey, model, prompt });
}

async function processImage({ apiKey, model, filename }) {
  const fallbackPrompt = `You are a knowledge management assistant. Based on the image filename, infer the overall topic and purpose of this image and return ONLY valid JSON with no markdown:

Filename: "${filename}"

{
  "title": "concise descriptive title under 60 chars",
  "summary": "1-2 sentences describing what this image likely contains and its purpose",
  "tags": ["up to 8 lowercase tags representing the overall domain, category, and purpose — not specific details. Use hyphens for multi-word tags. E.g. for a screenshot: ['screenshot', 'ui', 'web']. For a photo: ['photo', 'personal']."]
}`;
  return runGroqPrompt({ apiKey, model, prompt: fallbackPrompt });
}

module.exports = { processLink, processNote, processImage, LINK_PROMPT };
