const axios = require('axios');

module.exports = async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "Symbol required" });
  const s = symbol.toString().toUpperCase();

  const providers = [
    async () => {
      if (!process.env.FINANCIAL_API_KEY) throw new Error("No Key");
      const r = await axios.get(`https://api.financialdata.net/v1/quote?symbol=${s}&apikey=${process.env.FINANCIAL_API_KEY}`, { timeout: 2000 });
      return { price: r.data.price, change: r.data.change, changePercent: r.data.change_percent, source: "FinancialData.net" };
    },
    async () => {
      if (!process.env.ITICK_API_KEY) throw new Error("No Key");
      const r = await axios.get(`https://api.itick.org/v1/quote?symbol=${s}&apikey=${process.env.ITICK_API_KEY}`, { timeout: 2000 });
      return { price: r.data.price, change: r.data.change, changePercent: r.data.changePercent, source: "iTick" };
    },
    async () => {
      if (!process.env.FINNHUB_API_KEY) throw new Error("No Key");
      const r = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${s}&token=${process.env.FINNHUB_API_KEY}`, { timeout: 2000 });
      return { price: r.data.c, change: r.data.d, changePercent: r.data.dp, source: "Finnhub" };
    },
    async () => {
      const key = process.env.FMP_API_KEY || process.env.FINANCIAL_API_KEY;
      if (!key) throw new Error("No Key");
      const r = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${s}?apikey=${key}`, { timeout: 2000 });
      if (r.data?.[0]) {
        const q = r.data[0];
        return { price: q.price, change: q.change, changePercent: q.changesPercentage, source: "FMP" };
      }
      throw new Error("No Data");
    },
    async () => {
      if (!process.env.ALPACA_API_KEY || !process.env.ALPACA_SECRET_KEY) throw new Error("No Key");
      const r = await axios.get(`https://data.alpaca.markets/v2/stocks/${s}/quotes/latest`, {
        headers: { 'APCA-API-KEY-ID': process.env.ALPACA_API_KEY, 'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY },
        timeout: 2000
      });
      return { price: r.data.quote.ap, change: 0, changePercent: 0, source: "Alpaca" };
    }
  ];

  for (const fetcher of providers) {
    try {
      const data = await fetcher();
      if (data && data.price) return res.json(data);
    } catch (e) {}
  }

  res.json({ symbol: s, price: (150 + Math.random() * 50).toFixed(2), change: "0.00", changePercent: "0.00", source: "Simulation" });
};
