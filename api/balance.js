export default async function handler(req, res) {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

    const API_KEY = process.env.FINANCIAL_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'Missing API key' });

    const url = `https://api.financialdata.net/api/v1/balance-sheet/${symbol.toUpperCase()}?limit=1&token=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.financials || data.financials.length === 0) return res.status(404).json({ error: 'No balance sheet' });
        const bs = data.financials[0];
        res.status(200).json({
            totalAssets: bs.totalAssets,
            totalDebt: bs.totalDebt,
            cashAndCashEquivalents: bs.cashAndCashEquivalents,
            totalEquity: bs.totalEquity,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
