// Priority chain: FinancialData.net → iTick → Finnhub → FMP → Alpaca
export default async function handler(req, res) {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });
    const symbolUpper = symbol.toUpperCase();

    const formatResponse = (price, change, changePercent, source) => ({
        price, change, changePercent, source
    });

    // ----- 1. FinancialData.net -----
    if (process.env.FINANCIAL_API_KEY) {
        try {
            const url = `https://api.financialdata.net/api/v1/quotes?symbols=${symbolUpper}&token=${process.env.FINANCIAL_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            const quote = data[symbolUpper];
            if (quote?.price) {
                return res.status(200).json(formatResponse(quote.price, quote.change, quote.changePercent, 'financialdata'));
            }
        } catch (err) { console.warn('FinancialData.net failed:', err.message); }
    }

    // ----- 2. iTick -----
    if (process.env.ITICK_API_KEY) {
        try {
            const url = `https://api.itick.org/v1/stock/quote?symbol=${symbolUpper}&apikey=${process.env.ITICK_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data?.c) {
                return res.status(200).json(formatResponse(data.c, data.d, data.dp, 'itick'));
            }
        } catch (err) { console.warn('iTick failed:', err.message); }
    }

    // ----- 3. Finnhub (new) -----
    if (process.env.FINNHUB_API_KEY) {
        try {
            const url = `https://finnhub.io/api/v1/quote?symbol=${symbolUpper}&token=${process.env.FINNHUB_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data && typeof data.c === 'number') {
                return res.status(200).json(formatResponse(data.c, data.d, data.dp, 'finnhub'));
            }
        } catch (err) { console.warn('Finnhub failed:', err.message); }
    }

    // ----- 4. FinancialModelingPrep -----
    if (process.env.FMP_API_KEY) {
        try {
            const url = `https://financialmodelingprep.com/api/v3/quote/${symbolUpper}?apikey=${process.env.FMP_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data && data[0]?.price) {
                const quote = data[0];
                return res.status(200).json(formatResponse(quote.price, quote.change, quote.changesPercentage, 'fmp'));
            }
        } catch (err) { console.warn('FMP failed:', err.message); }
    }

    // ----- 5. Alpaca -----
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
            if (data?.last?.price) {
                return res.status(200).json(formatResponse(data.last.price, null, null, 'alpaca'));
            }
        } catch (err) { console.warn('Alpaca failed:', err.message); }
    }

    return res.status(503).json({ error: 'No quote available from any provider' });
}
