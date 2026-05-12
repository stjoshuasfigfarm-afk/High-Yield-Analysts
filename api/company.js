export default async function handler(req, res) {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });
    const sym = symbol.toUpperCase();

    // 1. Finnhub (fast, free)
    if (process.env.FINNHUB_API_KEY) {
        try {
            const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${process.env.FINNHUB_API_KEY}`;
            const data = await fetch(url).then(r => r.json());
            if (data?.name) {
                return res.json({
                    name: data.name,
                    sector: data.finnhubIndustry || data.sector,
                    employees: data.employeeTotal,
                    marketCap: data.marketCapitalization,
                });
            }
        } catch (e) { console.warn('Finnhub profile failed', e.message); }
    }

    // 2. FinancialData.net
    if (process.env.FINANCIAL_API_KEY) {
        try {
            const url = `https://api.financialdata.net/api/v1/companies/profile/${sym}?token=${process.env.FINANCIAL_API_KEY}`;
            const data = await fetch(url).then(r => r.json());
            if (data && (data.companyName || data.name)) {
                return res.json({
                    name: data.companyName || data.name,
                    sector: data.sector,
                    employees: data.employees || data.fullTimeEmployees,
                    marketCap: data.marketCap || data.market_cap,
                });
            }
        } catch (e) { console.warn('FinancialData profile failed', e.message); }
    }

    // 3. FinancialModelingPrep
    if (process.env.FMP_API_KEY) {
        try {
            const url = `https://financialmodelingprep.com/api/v3/profile/${sym}?apikey=${process.env.FMP_API_KEY}`;
            const data = await fetch(url).then(r => r.json());
            if (data[0]) {
                return res.json({
                    name: data[0].companyName,
                    sector: data[0].sector,
                    employees: data[0].fullTimeEmployees,
                    marketCap: data[0].mktCap,
                });
            }
        } catch (e) { console.warn('FMP profile failed', e.message); }
    }

    return res.status(503).json({ error: 'No company profile available' });
}
