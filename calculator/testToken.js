require('dotenv').config();
const axios = require('axios');

const url = 'http://20.244.56.144/evaluation-service/even';

axios.get(url, {
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`
  }
})
.then(res => {
  console.log("Success:", res.data);
})
.catch(err => {
  console.error("Error:", err.response?.status, err.response?.data);
});
