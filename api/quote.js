const axios = require('axios');

module.exports = async (req, res) => {
  const { symbol } = req.query;
  const apiKey = process.env.FINANCIAL_API_KEY;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  // Fallback data
  const mockData = {
    symbol: symbol.toUpperCase(),
    price: (Math.random() * 500 + 100).toFixed(2),
    change: (Math.random() * 5 - 2.5).toFixed(2),
    changePercent: (Math.random() * 4 - 2).toFixed(2)
  };

  if (!apiKey || apiKey === 'your_api_key_here') {
    return res.json(mockData);
  }

  try {
    // Attempt to fetch from Financial Modeling Prep (common permissive-ish API for free tier)
    const response = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`);
    if (response.data && response.data.length > 0) {
      const q = response.data[0];
      return res.json({
        symbol: q.symbol,
        price: q.price,
        change: q.change,
        changePercent: q.changesPercentage
      });
    }
    res.json(mockData);
  } catch (err) {
    res.json(mockData);
  }
};
