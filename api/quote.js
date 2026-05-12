export default async function handler(req, res) {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

    const API_KEY = process.env.FINANCIAL_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'Missing API key' });

    const url = `https://api.financialdata.net/api/v1/quotes?symbols=${symbol.toUpperCase()}&token=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        // Response from FinancialData.net free tier: { "AAPL": { "price": 175.23, ... } }
        const quoteData = data[symbol.toUpperCase()] || {};
        res.status(200).json({
            price: quoteData.price,
            change: quoteData.change,
            changePercent: quoteData.changePercent,
            source: 'financialdata'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
