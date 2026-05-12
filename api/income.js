export default async function handler(req, res) {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });
    const sym = symbol.toUpperCase();

    // FinancialData.net (quarterly)
    if (process.env.FINANCIAL_API_KEY) {
        try {
            const url = `https://api.financialdata.net/api/v1/income-statement/${sym}?period=quarterly&limit=4&token=${process.env.FINANCIAL_API_KEY}`;
            const data = await fetch(url).then(r => r.json());
            if (data?.financials?.length) {
                const quarters = data.financials.map(f => ({
                    date: f.date,
                    revenue: f.revenue,
                    netIncome: f.netIncome,
                }));
                return res.json({ quarters });
            }
        } catch (e) { console.warn('FinancialData income failed', e.message); }
    }

    // Fallback: FMP (annual)
    if (process.env.FMP_API_KEY) {
        try {
            const url = `https://financialmodelingprep.com/api/v3/income-statement/${sym}?limit=4&apikey=${process.env.FMP_API_KEY}`;
            const data = await fetch(url).then(r => r.json());
            if (data?.length) {
                const years = data.map(row => ({
                    date: row.date,
                    revenue: row.revenue,
                    netIncome: row.netIncome,
                }));
                return res.json({ quarters: years });
            }
        } catch (e) { console.warn('FMP income failed', e.message); }
    }

    return res.status(503).json({ error: 'No income data available' });
}
