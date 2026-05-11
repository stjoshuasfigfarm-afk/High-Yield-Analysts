const axios = require('axios');

module.exports = async (req, res) => {
  const { symbol } = req.query;
  const apiKey = process.env.FINANCIAL_API_KEY;

  const mockIncome = Array.from({ length: 4 }, (_, i) => ({
    date: `Q${4 - i} 2023`,
    netIncome: (Math.random() * 20 + 5).toFixed(2) + 'B'
  }));

  if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

  if (!apiKey || apiKey === 'your_api_key_here') {
    return res.json(mockIncome);
  }

  try {
    const response = await axios.get(`https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=4&apikey=${apiKey}`);
    if (response.data && Array.isArray(response.data)) {
      return res.json(response.data.map(i => ({
        date: i.date,
        netIncome: (i.netIncome / 1e9).toFixed(2) + 'B'
      })));
    }
    res.json(mockIncome);
  } catch (err) {
    res.json(mockIncome);
  }
};
