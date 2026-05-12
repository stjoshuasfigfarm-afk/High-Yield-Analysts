export default async function handler(req, res) {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

    const API_KEY = process.env.FINANCIAL_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'Missing API key' });

    // Note: FinancialData.net v1 uses symbols in path and query params
    const url = `https://api.financialdata.net/api/v1/income-statement/${symbol.toUpperCase()}?period=quarterly&limit=4&token=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.financials) return res.status(404).json({ error: 'No income data' });
        const quarters = data.financials.map(f => ({
            date: f.date,
            revenue: f.revenue,
            netIncome: f.netIncome,
        }));
        res.status(200).json({ quarters });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
