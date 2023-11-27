const icanloadjs = require('icanloadjs');
const { sleepIcan } = require('icanloadjs');

const urlToTest = 'https://jsonplaceholder.typicode.com/posts';
const method = 'GET';
const numRequests = 10;
sleepIcan(50000); // Sleep for 5 seconds
const numVirtualUsers = 10;
const thresholds = {
    maxFailedChecks: 2,
    http_req_failed: 0.01, // 1% failure rate
    http_req_duration: 200, // 95% of requests below 200ms
    // ... other thresholds
  };

icanloadjs.runIcan(urlToTest, method, numRequests, numVirtualUsers, thresholds);