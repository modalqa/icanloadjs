const icanloadjs = require('icanloadjs');

const urlToTest = 'https://www.legit-group.com';
const method = 'GET';
// const numRequests = 10;
// const numVirtualUsers = 5;
// const postData = { key: 'value' };
// const thresholds = {
//     maxFailedChecks: 5,run
// };

icanloadjs.runIcan(urlToTest, method);
