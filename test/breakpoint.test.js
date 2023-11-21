const { runBreakpointIcan } = require('icanloadjs');

// URL target dan konfigurasi pengujian
const url = 'https://hallowed-fluoridated-salmon.glitch.me';
const method = 'GET';
const numRequests = 10;
const numVirtualUsers = 2;
// const data = { /* your request payload */ };
const breakpoints = {
  maxRequests: 100,
  maxDataSize: 1024 * 1024, // 1 MB
  maxDuration: 500, // 500 milliseconds
  maxFailedChecks: 2,
};

(async () => {
  try {
    await runBreakpointIcan(url, method, numRequests, numVirtualUsers, breakpoints);
    console.log('Breakpoint test passed!');
  } catch (error) {
    console.error(`Breakpoint test failed: ${error.message}`);
  }
})();
