require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;

const WINDOW_SIZE = 10;
const window = new Set(); // stores unique values

const numberTypeToURL = {
    p: 'http://20.244.56.144/evaluation-service/primes',
    f: 'http://20.244.56.144/evaluation-service/fibo',
    e: 'http://20.244.56.144/evaluation-service/even',
    r: 'http://20.244.56.144/evaluation-service/rand'
};

// Load token from .env or hardcode for now if needed
const API_TOKEN = process.env.API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MzIyODQ1LCJpYXQiOjE3NDgzMjI1NDUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjE5N2NhNjUxLWU0NDEtNGY1YS1hMjcxLWM3MzAzYWMwYTI5OCIsInN1YiI6IjIyMzExYTY5MjVAaW90LnNyZWVuaWRoaS5lZHUuaW4ifSwiZW1haWwiOiIyMjMxMWE2OTI1QGlvdC5zcmVlbmlkaGkuZWR1LmluIiwibmFtZSI6InJvaGluaSBhdnVsYSIsInJvbGxObyI6IjIyMzExYTY5MjUiLCJhY2Nlc3NDb2RlIjoiUENxQVVLIiwiY2xpZW50SUQiOiIxOTdjYTY1MS1lNDQxLTRmNWEtYTI3MS1jNzMwM2FjMGEyOTgiLCJjbGllbnRTZWNyZXQiOiJtcUZVdnhzeXdQUGdLdUdNIn0.RF6XgsrxwZMYJB27z3ws892eBm-ECoZaV02Oqmpu9_E"; // Replace with full token

function fetchNumbers(type) {
    return axios.get(numberTypeToURL[type], {
        timeout: 500,
        headers: {
            Authorization: `Bearer ${API_TOKEN}`
        }
    });
}

app.get('/numbers/:numberid', async (req, res) => {
    const numberid = req.params.numberid;

    if (!['p', 'f', 'e', 'r'].includes(numberid)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    const windowPrevState = Array.from(window);
    let newNumbers = [];

    try {
        const response = await fetchNumbers(numberid);
        newNumbers = response.data.numbers || [];
    } catch (err) {
        console.error("Fetch error:", err.response?.status, err.response?.data);
        newNumbers = []; // treat errors as empty response
    }

    const tempWindow = Array.from(window);

    for (const num of newNumbers) {
        if (!window.has(num)) {
            tempWindow.push(num);
        }
    }

    while (tempWindow.length > WINDOW_SIZE) {
        tempWindow.shift();
    }

    // Update window
    window.clear();
    tempWindow.forEach(n => window.add(n));

    const windowCurrState = Array.from(window);
    const avg =
        windowCurrState.length > 0
            ? (
                  windowCurrState.reduce((a, b) => a + b, 0) / windowCurrState.length
              ).toFixed(2)
            : 0.0;

    const responsePayload = {
        windowPrevState,
        windowCurrState,
        numbers: newNumbers,
        avg: parseFloat(avg)
    };

    return res.status(200).json(responsePayload);
});



app.listen(PORT, () => {
    console.log(`✅ Microservice running at http://localhost:${PORT}`);
});
