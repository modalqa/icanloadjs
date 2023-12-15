const testConfigBasicAuth = {
    urlToTest: 'https://fakestoreapi.com/auth/login',
    method: 'POST',
    numRequests: 1,
    numVirtualUsers: 1,
  };

  const testConfigdailyTraffic = {
    urlToTest: 'https://fakestoreapi.com/products',
    method: 'GET',
    numRequests: 500,
    numVirtualUsers: 50,
    thresholds : {
      maxFailedChecks: 2,
      http_req_failed: 0.01,
      http_req_duration: 300,
    }
  };
  
module.exports = {
  testConfigBasicAuth,
  testConfigdailyTraffic,
};