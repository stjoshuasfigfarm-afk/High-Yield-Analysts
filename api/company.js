export default async function handler(req, res) {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });
    const symbolUpper = symbol.toUpperCase();

    // Try Finnhub first (fast, free)
    if (process.env.FINNHUB_API_KEY) {
        try {
            const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbolUpper}&token=${process.env.FINNHUB_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.name) {
                return res.status(200).json({
                    name: data.name,
                    sector: data.finnhubIndustry || data.sector,
                    employees: data.employeeTotal,
                    marketCap: data.marketCapitalization,
                });
            }
        } catch (err) { console.warn('Finnhub profile failed:', err.message); }
    }

    // Fallback to FinancialData.net
    if (process.env.FINANCIAL_API_KEY) {
        try {
            const url = `https://api.financialdata.net/api/v1/companies/profile/${symbolUpper}?token=${process.env.FINANCIAL_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data && (data.companyName || data.name)) {
                return res.status(200).json({
                    name: data.companyName || data.name,
                    sector: data.sector,
                    employees: data.employees || data.fullTimeEmployees,
                    marketCap: data.marketCap || data.market_cap,
                });
            }
        } catch (err) { console.warn('FinancialData.net company failed:', err.message); }
    }

    // Last resort: FMP
    if (process.env.FMP_API_KEY) {
        try {
            const url = `https://financialmodelingprep.com/api/v3/profile/${symbolUpper}?apikey=${process.env.FMP_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data && data[0]) {
                const profile = data[0];
                return res.status(200).json({
                    name: profile.companyName,
                    sector: profile.sector,
                    employees: profile.fullTimeEmployees,
                    marketCap: profile.mktCap,
                });
            }
        } catch (err) { console.warn('FMP company failed:', err.message); }
    }

    return res.status(503).json({ error: 'No company profile available' });
}
