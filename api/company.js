const axios = require('axios');

module.exports = async (req, res) => {
  const { symbol } = req.query;
  const apiKey = process.env.FINANCIAL_API_KEY;

  const mockCompany = {
    symbol: symbol?.toUpperCase() || 'AAPL',
    name: symbol?.toUpperCase() + ' Corp',
    sector: 'Technology',
    employees: (Math.random() * 200000 + 50000).toFixed(0),
    marketCap: (Math.random() * 2.5 + 0.5).toFixed(2) + 'T',
    hq: 'United States'
  };

  if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

  if (!apiKey || apiKey === 'your_api_key_here') {
    return res.json(mockCompany);
  }

  try {
    const response = await axios.get(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`);
    if (response.data && response.data.length > 0) {
      const p = response.data[0];
      return res.json({
        symbol: p.symbol,
        name: p.companyName,
        sector: p.sector,
        employees: p.fullTimeEmployees,
        marketCap: (p.mktCap / 1e12).toFixed(2) + 'T',
        hq: p.city + ', ' + p.country
      });
    }
    res.json(mockCompany);
  } catch (err) {
    res.json(mockCompany);
  }
};
