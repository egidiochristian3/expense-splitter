const axios = require('axios');

let ratesCache = null;
let lastFetched = null;
const CACHE_DURATION = 60 * 60 * 1000;

const getRates = async (req, res) => {
  try {
    const now = Date.now();

    if (ratesCache && lastFetched && (now - lastFetched) < CACHE_DURATION) {
      return res.json(ratesCache);
    }

    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/latest/USD`
    );

    ratesCache = response.data;
    lastFetched = now;

    res.json(ratesCache);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch currency rates' });
  }
};

const convertCurrency = async (req, res) => {
  try {
    const { amount, from, to } = req.body;

    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/pair/${from}/${to}/${amount}`
    );

    res.json({
      from,
      to,
      amount,
      convertedAmount: response.data.conversion_result,
      rate: response.data.conversion_rate
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to convert currency' });
  }
};

module.exports = { getRates, convertCurrency };