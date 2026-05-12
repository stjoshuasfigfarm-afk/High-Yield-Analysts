// Priority: FinancialData.net → iTick → Finnhub → FMP → Alpaca
export default async function handler(req, res) {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

    const sym = symbol.toUpperCase();
    const format = (price, change, changePercent, source) => ({ price, change, changePercent, source });

    // 1. FinancialData.net
    if (process.env.FINANCIAL_API_KEY) {
        try {
            const url = `https://api.financialdata.net/api/v1/quotes?symbols=${sym}&token=${process.env.FINANCIAL_API_KEY}`;
            const data = await fetch(url).then(r => r.json());
            const quote = data[sym];
            if (quote?.price) return res.json(format(quote.price, quote.change, quote.changePercent, 'financialdata'));
        } catch (e) { console.warn('FinancialData quote failed', e.message); }
    }

    // 2. iTick
    if (process.env.ITICK_API_KEY) {
        try {
            const url = `https://api.itick.org/v1/stock/quote?symbol=${sym}&apikey=${process.env.ITICK_API_KEY}`;
            const data = await fetch(url).then(r => r.json());
            if (data?.c) return res.json(format(data.c, data.d, data.dp, 'itick'));
        } catch (e) { console.warn('iTick quote failed', e.message); }
    }

    // 3. Finnhub
    if (process.env.FINNHUB_API_KEY) {
        try {
            const url = `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${process.env.FINNHUB_API_KEY}`;
            const data = await fetch(url).then(r => r.json());
            if (data && typeof data.c === 'number') return res.json(format(data.c, data.d, data.dp, 'finnhub'));
        } catch (e) { console.warn('Finnhub quote failed', e.message); }
    }

    // 4. FinancialModelingPrep
    if (process.env.FMP_API_KEY) {
        try {
            const url = `https://financialmodelingprep.com/api/v3/quote/${sym}?apikey=${process.env.FMP_API_KEY}`;
            const data = await fetch(url).then(r => r.json());
            if (data[0]?.price) return res.json(format(data[0].price, data[0].change, data[0].changesPercentage, 'fmp'));
        } catch (e) { console.warn('FMP quote failed', e.message); }
    }

    // 5. Alpaca
    if (process.env.ALPACA_API_KEY && process.env.ALPACA_SECRET_KEY) {
        try {
            const url = `https://data.alpaca.markets/v1/last/stocks/${sym}`;
            const data = await fetch(url, {
                headers: {
                    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY,
                    'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY
                }
            }).then(r => r.json());
            if (data?.last?.price) return res.json(format(data.last.price, null, null, 'alpaca'));
        } catch (e) { console.warn('Alpaca quote failed', e.message); }
    }

    return res.status(503).json({ error: 'No quote available from any provider' });
}
