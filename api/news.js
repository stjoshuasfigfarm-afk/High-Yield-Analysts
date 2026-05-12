export default async function handler(req, res) {
    const { symbol, limit = 5 } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

    const API_KEY = process.env.MARKETAUX_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'Marketaux API key not configured' });

    const url = `https://api.marketaux.com/v1/news/all?symbols=${symbol.toUpperCase()}&filter_entities=true&language=en&limit=${Math.min(limit, 20)}&api_token=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data?.data?.length) {
            const articles = data.data.map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                published_at: article.published_at,
                source: article.source,
                sentiment: article.entities?.[0]?.sentiment_score || null
            }));
            return res.json({ articles, total: data.meta.found });
        } else {
            return res.status(404).json({ error: 'No news found' });
        }
    } catch (err) {
        console.error('Marketaux error:', err);
        return res.status(500).json({ error: err.message });
    }
}
