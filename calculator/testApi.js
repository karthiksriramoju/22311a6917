const axios = require('axios');

const numberTypeToURL = {
  p: 'http://20.244.56.144/evaluation-service/primes',
  f: 'http://20.244.56.144/evaluation-service/fibo',
  e: 'http://20.244.56.144/evaluation-service/even',
  r: 'http://20.244.56.144/evaluation-service/rand'
};

async function testApis() {
  for (const [type, url] of Object.entries(numberTypeToURL)) {
    try {
      console.log(`Fetching ${type} from ${url} ...`);
      const response = await axios.get(url, { timeout: 3000 });
      console.log(`Response for ${type}:`, response.data);
    } catch (err) {
      console.error(`Error fetching ${type} from ${url}:`, err.message);
    }
    console.log('------------------------------------');
  }
}

testApis();
