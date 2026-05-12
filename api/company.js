const axios = require('axios');

module.exports = async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "Symbol required" });
  const s = symbol.toString().toUpperCase();

  const providers = [
    async () => {
      if (!process.env.FINNHUB_API_KEY) throw new Error("No Key");
      const r = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${s}&token=${process.env.FINNHUB_API_KEY}`, { timeout: 2000 });
      return { name: r.data.name, sector: r.data.finnhubIndustry, employees: r.data.fullTimeEmployees || "N/A", marketCap: (r.data.marketCapitalization/1000).toFixed(2)+"T", source: "Finnhub" };
    },
    async () => {
      if (!process.env.FINANCIAL_API_KEY) throw new Error("No Key");
      const r = await axios.get(`https://api.financialdata.net/v1/company?symbol=${s}&apikey=${process.env.FINANCIAL_API_KEY}`, { timeout: 2000 });
      return { name: r.data.name, sector: r.data.sector, employees: r.data.employees, marketCap: r.data.market_cap, source: "FinancialData.net" };
    },
    async () => {
      const key = process.env.FMP_API_KEY || process.env.FINANCIAL_API_KEY;
      if (!key) throw new Error("No Key");
      const r = await axios.get(`https://financialmodelingprep.com/api/v3/profile/${s}?apikey=${key}`, { timeout: 2000 });
      if (r.data?.[0]) {
        const p = r.data[0];
        return { name: p.companyName, sector: p.sector, employees: p.fullTimeEmployees, marketCap: (p.mktCap/1e12).toFixed(2)+"T", source: "FMP" };
      }
      throw new Error("No Data");
    }
  ];

  for (const fetcher of providers) {
    try {
      const data = await fetcher();
      if (data && data.name) return res.json(data);
    } catch (e) {}
  }

  res.json({ name: s + " Corp", sector: "Financial Services", employees: "10,000", marketCap: "1.2T", source: "Simulation" });
};
