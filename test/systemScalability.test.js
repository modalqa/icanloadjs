const icanloadjs = require('icanloadjs');

const urlToTest = 'https://fakestoreapi.com/products';
const method = 'GET';
const numRequests = 10;
const numVirtualUsers = 20;
const thresholds = {
  maxFailedChecks: 10,
  http_req_failed: 0.03, // 3% failure rate allowed
  http_req_duration: 10, // 95% of requests below 800ms
  // ... other thresholds
};

const targetArrivalRate = 30; // Simulate fluctuating traffic for scalability testing (30 requests per second)

icanloadjs.runIcanWithArrivalRate(urlToTest, method, numRequests, targetArrivalRate, thresholds, numVirtualUsers);
