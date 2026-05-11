const axios = require('axios');

module.exports = async (req, res) => {
  const { symbol } = req.query;
  const apiKey = process.env.FINANCIAL_API_KEY;

  const mockBalance = {
    totalAssets: (Math.random() * 400 + 100).toFixed(2) + 'B',
    totalDebt: (Math.random() * 200 + 50).toFixed(2) + 'B',
    cash: (Math.random() * 100 + 20).toFixed(2) + 'B',
    equity: (Math.random() * 300 + 50).toFixed(2) + 'B'
  };

  if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

  if (!apiKey || apiKey === 'your_api_key_here') {
    return res.json(mockBalance);
  }

  try {
    const response = await axios.get(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=1&apikey=${apiKey}`);
    if (response.data && response.data.length > 0) {
      const b = response.data[0];
      return res.json({
        totalAssets: (b.totalAssets / 1e9).toFixed(2) + 'B',
        totalDebt: (b.totalTotalDebt / 1e9).toFixed(2) + 'B',
        cash: (b.cashAndCashEquivalents / 1e9).toFixed(2) + 'B',
        equity: (b.totalStockholdersEquity / 1e9).toFixed(2) + 'B'
      });
    }
    res.json(mockBalance);
  } catch (err) {
    res.json(mockBalance);
  }
};
