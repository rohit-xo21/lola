const { extract } = require('@extractus/article-extractor');

/**
 * Fetch URL metadata + full article text
 * Returns { title, description, previewImage, favicon, rawContent }
 */
async function scrapeUrl(url) {
  try {
    const article = await extract(url);
    if (!article) throw new Error('Could not extract article');

    const rawContent = article.content
      ? stripHtml(article.content).slice(0, 32000) // ~8000 tokens
      : '';

    const favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;

    return {
      title: article.title || '',
      description: article.description || '',
      previewImage: article.image || '',
      favicon,
      rawContent,
    };
  } catch (err) {
    console.error('[scraper] Failed:', err.message);
    // Graceful fallback — return at least the URL
    let favicon = '';
    try { favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`; } catch (_) {}
    return { title: '', description: '', previewImage: '', favicon, rawContent: '' };
  }
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

module.exports = { scrapeUrl };
