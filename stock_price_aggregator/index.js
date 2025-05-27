const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MzIzMTAyLCJpYXQiOjE3NDgzMjI4MDIsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjFhNTQ2NTJkLTVmOWQtNDU1OS05YWFhLTBjOGMzMGE2NDQ4ZCIsInN1YiI6IjIyMzExYTY5MTdAaW90LnNyZWVuaWRoaS5lZHUuaW4ifSwiZW1haWwiOiIyMjMxMWE2OTE3QGlvdC5zcmVlbmlkaGkuZWR1LmluIiwibmFtZSI6ImthcnRoaWsgc3JpcmFtb2p1Iiwicm9sbE5vIjoiMjIzMTFhNjkxNyIsImFjY2Vzc0NvZGUiOiJQQ3FBVUsiLCJjbGllbnRJRCI6IjFhNTQ2NTJkLTVmOWQtNDU1OS05YWFhLTBjOGMzMGE2NDQ4ZCIsImNsaWVudFNlY3JldCI6IkhOWlZodm1aZG1QcVZ6dkIifQ.naW1b92dpnn3oBCft1zYe8EtCVSmXBF71dFb878DtC8';
const BASE_URL = 'http://20.244.56.144/evaluation-service';

// Middleware to set Authorization header
app.use((req, res, next) => {
  req.headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  next();
});

// POST /stocks
app.post('/stocks', async (req, res) => {
  const { symbol } = req.body;
  try {
    const response = await axios.get(`${BASE_URL}/stocks/${symbol}`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stock data' });
  }
});

// GET /stocks/:ticker
app.get('/stocks/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const { minutes, aggregation } = req.query;
  try {
    const response = await axios.get(`${BASE_URL}/stocks/${ticker}?minutes=${minutes}`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });
    const prices = response.data.map(entry => entry.price);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    res.json({
      averageStockPrice: averagePrice,
      priceHistory: response.data
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stock data' });
  }
});

// GET /stockcorrelation
app.get('/stockcorrelation', async (req, res) => {
  const { minutes, ticker } = req.query;
  if (!Array.isArray(ticker) || ticker.length !== 2) {
    return res.status(400).json({ error: 'Please provide exactly two tickers' });
  }
  try {
    const responses = await Promise.all(
      ticker.map(t =>
        axios.get(`${BASE_URL}/stocks/${t}?minutes=${minutes}`, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`
          }
        })
      )
    );
    const data = responses.map(response => response.data);
    // Compute correlation here
    // For brevity, the correlation computation is omitted
    res.json({
      correlation: 'Computed value',
      stocks: {
        [ticker[0]]: {
          averagePrice: 'Computed value',
          priceHistory: data[0]
        },
        [ticker[1]]: {
          averagePrice: 'Computed value',
          priceHistory: data[1]
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stock data' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
