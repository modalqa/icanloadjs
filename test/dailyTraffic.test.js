const icanloadjs = require('icanloadjs');

const urlToTest = 'https://fakestoreapi.com/products';
const method = 'GET';
const numRequests = 500;
const numVirtualUsers = 50;
const thresholds = {
  maxFailedChecks: 2,
  http_req_failed: 0.01, // 1% failure rate allowed
  http_req_duration: 300, // 95% of requests below 300ms
  // ... other thresholds
};

const targetArrivalRate = 2; // Simulate normal daily traffic (2 requests per second)

icanloadjs.runIcanWithArrivalRate(urlToTest, method, numRequests, numVirtualUsers, targetArrivalRate, thresholds);
