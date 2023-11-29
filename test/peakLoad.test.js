const icanloadjs = require('icanloadjs');

const urlToTest = 'https://fakestoreapi.com/products';
const method = 'GET';
const numRequests = 1000;
const numVirtualUsers = 100;
const thresholds = {
  maxFailedChecks: 5,
  http_req_failed: 0.02, // 2% failure rate allowed
  http_req_duration: 500, // 95% of requests below 500ms
  // ... other thresholds
};

const targetArrivalRate = 20; // Simulate a peak traffic scenario (20 requests per second)

icanloadjs.runIcanWithArrivalRate(urlToTest, method, numRequests,numVirtualUsers, targetArrivalRate, thresholds);
