const Groq = require('groq-sdk');

const LINK_PROMPT = (content) => `You are a knowledge management assistant. Analyze the following text and return ONLY valid JSON with no markdown, no explanation, nothing outside the JSON.

Text:
"""
${content.slice(0, 28000)}
"""

Return this exact JSON:
{
  "title": "Clean Concise Title Under 80 Chars That Captures The Essence Of The Content With Caps And No Special Formatting",
  "summary": "2-4 sentences capturing the core idea and why it matters",
  "key_points": ["up to 6 short bullet points of key takeaways"],
  "tags": ["1-2 generic category tags from: articles, finance, hacks, personal, routine, tech, health, business, design, productivity, tools, news, research, tutorial, or similar broad categories. Pick what best fits the content. Use lowercase."],
  "category": "one of: article | tutorial | video | recipe | paper | tool | inspiration | other",
  "reading_time_minutes": <integer>
}`;

const NOTE_PROMPT = (content) => `Analyze this note and return ONLY valid JSON with no markdown:

"""
${content.slice(0, 8000)}
"""

{
  "title": "Short Descriptive Title",
  "summary": "one sentence summary",
  "tags": ["1-2 generic category tags from: articles, finance, hacks, personal, routine, tech, health, business, design, productivity, tools, news, research, or similar. Use lowercase."]
}`;

const IMAGE_PROMPT = () => `Describe this image concisely, then return ONLY valid JSON:
{
  "title": "What This Image Shows In Under 60 Chars",
  "summary": "1-2 sentence description",
  "tags": ["1-2 generic category tags from: articles, finance, hacks, personal, routine, tech, health, business, design, productivity, tools, inspiration, or similar. Use lowercase."]
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
  "title": "Concise Descriptive Title Under 60 Chars",
  "summary": "1-2 sentences describing what this image likely contains and its purpose",
  "tags": ["up to 8 lowercase tags representing the overall domain, category, and purpose — not specific details. Use hyphens for multi-word tags. E.g. for a screenshot: ['screenshot', 'ui', 'web']. For a photo: ['photo', 'personal']."]
}`;
  return runGroqPrompt({ apiKey, model, prompt: fallbackPrompt });
}

module.exports = { processLink, processNote, processImage, LINK_PROMPT };
