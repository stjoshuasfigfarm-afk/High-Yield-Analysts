// Priority chain: FinancialData.net → iTick → FMP → Alpaca
export default async function handler(req, res) {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

    const symbolUpper = symbol.toUpperCase();

    // Helper to standardize output format
    const formatResponse = (price, change, changePercent, source) => ({
        price: price,
        change: change,
        changePercent: changePercent,
        source: source
    });

    // ----- Provider 1: FinancialData.net -----
    if (process.env.FINANCIAL_API_KEY) {
        try {
            const url = `https://api.financialdata.net/api/v1/quotes?symbols=${symbolUpper}&token=${process.env.FINANCIAL_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            const quote = data[symbolUpper];
            if (quote && quote.price) {
                return res.status(200).json(formatResponse(quote.price, quote.change, quote.changePercent, 'financialdata'));
            }
        } catch (err) { console.warn('FinancialData.net failed:', err.message); }
    }

    // ----- Provider 2: iTick -----
    if (process.env.ITICK_API_KEY) {
        try {
            const url = `https://api.itick.org/v1/stock/quote?symbol=${symbolUpper}&apikey=${process.env.ITICK_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.c) {
                return res.status(200).json(formatResponse(data.c, data.d, data.dp, 'itick'));
            }
        } catch (err) { console.warn('iTick failed:', err.message); }
    }

    // ----- Provider 3: FinancialModelingPrep -----
    if (process.env.FMP_API_KEY) {
        try {
            const url = `https://financialmodelingprep.com/api/v3/quote/${symbolUpper}?apikey=${process.env.FMP_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data && data[0] && data[0].price) {
                const quote = data[0];
                return res.status(200).json(formatResponse(quote.price, quote.change, quote.changesPercentage, 'fmp'));
            }
        } catch (err) { console.warn('FMP failed:', err.message); }
    }

    // ----- Provider 4: Alpaca (requires API key + secret) -----
    if (process.env.ALPACA_API_KEY && process.env.ALPACA_SECRET_KEY) {
        try {
            const url = `https://data.alpaca.markets/v1/last/stocks/${symbolUpper}`;
            const response = await fetch(url, {
                headers: {
                    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY,
                    'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY
                }
            });
            const data = await response.json();
            if (data && data.last && data.last.price) {
                // Alpaca free tier doesn't provide change/changePercent, so we omit them
                return res.status(200).json(formatResponse(data.last.price, null, null, 'alpaca'));
            }
        } catch (err) { console.warn('Alpaca failed:', err.message); }
    }

    // All providers failed or missing keys
    return res.status(503).json({ error: 'No quote available from any provider' });
}
