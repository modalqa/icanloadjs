const icanloadjs = require('icanloadjs');

const urlToTest = 'https://jsonplaceholder.typicode.com/posts';
const method = 'GET';
const numRequests = 1;
const numVirtualUsers = 1;
const thresholds = {
    maxFailedChecks: 1,
    http_req_failed: 0.01, // 1% failure rate
    http_req_duration: 200, // 95% of requests below 200ms
    // ... other thresholds
  };

icanloadjs.runIcan(urlToTest, method, numRequests, numVirtualUsers, thresholds);