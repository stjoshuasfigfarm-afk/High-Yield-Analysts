const axios = require('axios');

module.exports = async (req, res) => {
  const { symbol } = req.query;
  const apiKey = process.env.MARKETAUX_API_KEY;

  if (!apiKey) {
    return res.json({ articles: [{ title: "MARKET NEWS UNAVAILABLE - NO API KEY", source: "System" }] });
  }

  try {
    const url = `https://api.marketaux.com/v1/news/all?symbols=${symbol || 'AAPL,MSFT,TSLA'}&filter_entities=true&limit=10&api_token=${apiKey}`;
    const response = await axios.get(url, { timeout: 3000 });
    res.json({ articles: response.data.data || [] });
  } catch (err) {
    res.json({ articles: [{ title: "ERROR FETCHING NEWS STREAM", source: "System" }] });
  }
};
