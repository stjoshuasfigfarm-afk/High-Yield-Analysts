export default async function handler(req, res) {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });
    const sym = symbol.toUpperCase();

    if (process.env.FINANCIAL_API_KEY) {
        try {
            const url = `https://api.financialdata.net/api/v1/balance-sheet/${sym}?limit=1&token=${process.env.FINANCIAL_API_KEY}`;
            const data = await fetch(url).then(r => r.json());
            if (data?.financials?.length) {
                const bs = data.financials[0];
                return res.json({
                    totalAssets: bs.totalAssets,
                    totalDebt: bs.totalDebt,
                    cashAndCashEquivalents: bs.cashAndCashEquivalents,
                    totalEquity: bs.totalEquity,
                });
            }
        } catch (e) { console.warn('FinancialData balance failed', e.message); }
    }

    if (process.env.FMP_API_KEY) {
        try {
            const url = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${sym}?limit=1&apikey=${process.env.FMP_API_KEY}`;
            const data = await fetch(url).then(r => r.json());
            if (data?.length) {
                const bs = data[0];
                return res.json({
                    totalAssets: bs.totalAssets,
                    totalDebt: bs.totalDebt,
                    cashAndCashEquivalents: bs.cashAndCashEquivalents,
                    totalEquity: bs.totalEquity,
                });
            }
        } catch (e) { console.warn('FMP balance failed', e.message); }
    }

    return res.status(503).json({ error: 'No balance sheet data available' });
}
