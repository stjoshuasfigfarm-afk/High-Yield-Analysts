export default async function handler(req, res) {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

    const API_KEY = process.env.FINANCIAL_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'Missing API key' });

    const url = `https://api.financialdata.net/api/v1/companies/profile/${symbol.toUpperCase()}?token=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json({
            name: data.companyName || data.name,
            sector: data.sector,
            employees: data.employees || data.fullTimeEmployees,
            marketCap: data.marketCap || data.market_cap,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
