const https = require('https');
const http = require('http');

class VirtualUser {
  constructor() {
    this.requestCounter = 0;
  }

  incrementRequestCounter() {
    this.requestCounter++;
  }

  getRequestCount() {
    return this.requestCounter;
  }
}

class icanloadjs {
  constructor(thresholds) {
    this.virtualUsers = [];
    this.counter = 0;
    this.totalRequests = 0;
    this.minValue = Infinity;
    this.maxValue = -Infinity;
    this.nonZeroCount = 0;
    this.sum = 0;
    this.values = [];
    this.socketWaitTime = 0;
    this.checksPassed = 0;
    this.checksFailed = 0;
    this.thresholds = thresholds;
    this.sentDataSize = 0;
    this.receivedDataSize = 0;
    this.droppedIterations = 0;
    this.droppedIterationsDetails = [];
  }

  createVirtualUser() {
    const virtualUser = new VirtualUser();
    this.virtualUsers.push(virtualUser);
    return virtualUser;
  }

  incrementCounter() {
    this.counter++;
    this.totalRequests++;
  }

  trackValue(value) {
    this.values.push(value);
    this.sum += value;
    this.nonZeroCount += value !== 0 ? 1 : 0;

    if (value < this.minValue) {
      this.minValue = value;
    }

    if (value > this.maxValue) {
      this.maxValue = value;
    }
  }

  trackSocketWaitTime(time) {
    this.socketWaitTime += time;
  }

  // Metode untuk melacak pemeriksaan yang berhasil
  trackCheckPassed() {
    this.checksPassed++;
  }
  
  trackCheckFailed() {
    this.checksFailed++;
  }

   // Metode untuk melacak ukuran data terkirim
   trackSentDataSize(size) {
    this.sentDataSize += size;
  }

  // Metode untuk melacak ukuran data diterima
  trackReceivedDataSize(size) {
    this.receivedDataSize += size;
  }


  calculateMetrics() {
    const averageValue = this.sum / this.counter;
    const modeValue = this.calculateMode();
    const percentileValue = this.calculatePercentile(50);

    const metrics = {
      checksFailed: this.checksFailed,
      counter: this.counter,
      totalRequests: this.totalRequests,
      minValue: this.minValue,
      maxValue: this.maxValue,
      nonZeroCount: this.nonZeroCount,
      sum: this.sum,
      averageValue,
      modeValue,
      percentileValue,
      socketWaitTime: this.socketWaitTime,
      checksPassed: this.checksPassed,
      virtualUsers: this.virtualUsers.map((user) => ({
        requestCount: user.getRequestCount(),
      })),
      // Menambahkan metrik ukuran data terkirim dan diterima
      sentDataSize: this.sentDataSize,
      receivedDataSize: this.receivedDataSize,
    };

    if (this.droppedIterations !== undefined) {
      metrics.droppedIterations = this.droppedIterations;
    }

    if (this.droppedIterationsDetails.length > 0) {
      metrics.droppedIterationsDetails = this.droppedIterationsDetails;
    }

    return metrics;
}
  incrementDroppedIterations(details) {
    this.droppedIterations++;
    this.droppedIterationsDetails.push(details); // Store details of dropped iterations
  }

  calculateMode() {
    // Implementasi perhitungan mode di sini (seperti menggunakan algoritma statistik)
    return this.values[0];
  }

  calculatePercentile(percentile) {
    const index = Math.floor((percentile / 100) * this.values.length);
    return this.values[index];
  }
}


const sleepIcan = (minMilliseconds, maxMilliseconds) => {
  const duration = Math.floor(Math.random() * (maxMilliseconds - minMilliseconds + 1)) + minMilliseconds;
  return new Promise(resolve => setTimeout(resolve, duration));
};

const performHttpRequest = async (url, method = 'GET', data = null, metrics, virtualUser, auth = null) => {
  try {
  // Set batas pendengar maksimum untuk semua EventEmitter
  require('events').EventEmitter.defaultMaxListeners = 25;
  virtualUser.incrementRequestCounter();
  metrics.incrementCounter();

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https://') ? https : http;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    if (auth) {
      if (auth.type === 'basic') {
        const base64Credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
        options.headers['Authorization'] = `Basic ${base64Credentials}`;
      } else if (auth.type === 'token') {
        options.headers['Authorization'] = `Bearer ${auth.token}`;
      } else if (auth.type === 'custom') {
        // Handle custom authentication logic here
        options.headers['Custom-Authorization'] = `Custom ${auth.customValue}`;
      }
      // Add more authentication methods as needed
    }

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.from(jsonData).length;
      metrics.trackSentDataSize(Buffer.from(jsonData).length);
    }

    const startTime = Date.now();
    let socketAllocatedTime;
    let tokenFromResponse;
    let errorDisplayed = false;


    const req = protocol.request(url, options, (res) => {
      const chunks = [];

      res.on('data', (responseData) => {
        metrics.trackReceivedDataSize(responseData.length);
        chunks.push(responseData);
      });

      res.on('end', () => {
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        metrics.trackValue(elapsedTime);
      
        if (socketAllocatedTime) {
          const waitingTime = startTime - socketAllocatedTime;
          metrics.trackSocketWaitTime(waitingTime);
        }
      
        if (res.statusCode === 200) {
          metrics.trackCheckPassed();
      
          // Periksa tipe konten sebelum menguraikannya sebagai JSON
          const contentType = res.headers['content-type'];
          if (contentType && contentType.includes('application/json')) {
            try {
              const responseData = JSON.parse(Buffer.concat(chunks).toString());
              tokenFromResponse = responseData.token;
            } catch (error) {
              // Tampilkan pesan kesalahan hanya sekali
              if (!errorDisplayed) {
                console.error('Error parsing response data:', error.message);
                errorDisplayed = true;
              }
            }
          } else {
            // Tampilkan pesan kesalahan hanya sekali
            if (!errorDisplayed) {
              console.error('Error: Unexpected content type. Response is not JSON.');
              errorDisplayed = true;
            }
          }
        } else {
          metrics.trackCheckFailed();
          metrics.incrementDroppedIterations({ url, method, data, auth });
        }
      
        resolve({ elapsedTime, token: tokenFromResponse });
      });
      
    });

    req.on('socket', (socket) => {
      socket.on('allocate', () => {
        socketAllocatedTime = Date.now();
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
        const errorMessage =
          error.code === 'ECONNRESET'
            ? 'ECONNRESET or connection to the server is lost'
            : error.code === 'ETIMEDOUT'
            ? 'ETIMEDOUT - Request timed out'
            : 'ECONNREFUSED - Connection refused by the server';

        console.error(`Error: ${errorMessage}. Stopping the performance test.`);
        metrics.trackCheckFailed();
        metrics.incrementDroppedIterations({ url, method, data, auth });
        process.exit(1);
      } else {
        console.error('Error in HTTP request:', error.message);
        reject(error);
      }
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
} catch (error) {
  if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
    const errorMessage =
      error.code === 'ETIMEDOUT' ? 'ETIMEDOUT - Request timed out' : 'ECONNREFUSED - Connection refused by the server';
    console.error(`Error: ${errorMessage}. Stopping the performance test.`);
    metrics.trackCheckFailed();
    metrics.incrementDroppedIterations({ url, method, data, auth });
    process.exit(1);
  } else {
    console.error('Error in performHttpRequest:', error.message);
    throw error;
  }
}
};

// Versi bisa config
const runIcan = async (url, method = 'GET', numRequests = 1, numVirtualUsers = 1, data = null, thresholds = {}, durationTest = 0, additionalParams = {}) => {
  // ...

// Versi 1.0.10
// const runIcan = async (url, method = 'GET', numRequests = 1, numVirtualUsers = 1, data = null, thresholds = {}, durationTest = 0) => {
  const metrics = new icanloadjs(thresholds);

  const virtualUsers = Array.from({ length: numVirtualUsers }, () => metrics.createVirtualUser());

  const requests = virtualUsers.map((user) =>
    Array.from({ length: numRequests }, () => performHttpRequest(url, method, data, metrics, user))
  );

  const startTime = Date.now();

  // Display the animation message "-------ICANLOADJS-------" with loading animation
  const loadingAnimation = ['|', '/', '-', '\\'];
  let animationIndex = 0;
  const loadingInterval = setInterval(() => {
    process.stdout.write(`\rLoading ${loadingAnimation[animationIndex]} Testing Performance...`);
    animationIndex = (animationIndex + 1) % loadingAnimation.length;
  }, 100);

  await Promise.all(requests.flat());

  clearInterval(loadingInterval);
  process.stdout.write('\r'); // Clear loading animation line

  const endTime = Date.now();
  const testDurationInSeconds = (endTime - startTime) / 1000;

  const calculatedMetrics = metrics.calculateMetrics();
  calculatedMetrics.testDurationInSeconds = testDurationInSeconds;

  console.log('----------ICANLOADJS----------');
  console.log(`Performance test completed for ${numRequests * numVirtualUsers} requests by ${numVirtualUsers} virtual users.`);
  console.log('Metrics:');
  console.log(calculatedMetrics);
  console.log(`Test duration: ${testDurationInSeconds} seconds`);

  // Check if thresholds are defined before accessing their properties
  if (thresholds.maxFailedChecks && calculatedMetrics.checksFailed > thresholds.maxFailedChecks) {
    console.error(`Performance test failed: Exceeded the maximum allowed failed checks.`);
    process.exit(1);
  }

  // Additional matrix checks
  if (thresholds.http_req_failed && calculatedMetrics.checksFailedRate > thresholds.http_req_failed) {
    console.error(`Performance test failed: http_req_failed rate exceeded the allowed threshold.`);
    process.exit(1);
  }

  if (thresholds.http_req_duration && calculatedMetrics.percentileValue > thresholds.http_req_duration) {
    console.error(`Performance test failed: http_req_duration exceeded the allowed threshold.`);
    process.exit(1);
  }

  console.log(`Performance test passed on ${new Date().toLocaleDateString()}.`);
};

// Breakpoint Testing
runBreakpointIcan = async (url, method = 'GET', numRequests = 1, numVirtualUsers = 1, data = null, breakpoints = {}, durationTest = 0) => {
  const metrics = new icanloadjs();

  const virtualUsers = Array.from({ length: numVirtualUsers }, () => metrics.createVirtualUser());

  const requests = virtualUsers.map((user) =>
    Array.from({ length: numRequests }, () => performHttpRequest(url, method, data, metrics, user))
  );
  
  // Display the animation message "-------ICANLOADJS Breakpoint Test-------" with loading animation
  const loadingAnimation = ['|', '/', '-', '\\'];
  let animationIndex = 0;
  const loadingInterval = setInterval(() => {
    process.stdout.write(`\rLoading ${loadingAnimation[animationIndex]} Running Breakpoint Test...`);
    animationIndex = (animationIndex + 1) % loadingAnimation.length;
  }, 100);

  await Promise.all(requests.flat());

  clearInterval(loadingInterval);
  process.stdout.write('\r'); // Clear loading animation line

  const calculatedMetrics = metrics.calculateMetrics();
  calculatedMetrics.testDurationInSeconds = durationTest; // Tambahkan durasi pengujian ke dalam metrik

  console.log('----------ICANLOADJS----------');
  console.log(`Breakpoint test completed for ${numRequests * numVirtualUsers} requests by ${numVirtualUsers} virtual users.`);
  console.log('Metrics:');
  console.log(calculatedMetrics);

  // Check if thresholds are defined before accessing their properties
  if (breakpoints.maxRequests && calculatedMetrics.totalRequests > breakpoints.maxRequests) {
    console.error(`Breakpoint test failed: Exceeded the maximum allowed requests.`);
  }

  if (breakpoints.maxDataSize && calculatedMetrics.receivedDataSize > breakpoints.maxDataSize) {
    console.error(`Breakpoint test failed: Exceeded the maximum allowed data size.`);
  }

  if (breakpoints.maxDuration && calculatedMetrics.percentileValue > breakpoints.maxDuration) {
    console.error(`Breakpoint test failed: Exceeded the maximum allowed duration.`);
  }

  // Add more breakpoint checks as needed

  if (
    breakpoints.maxFailedChecks &&
    calculatedMetrics.checksFailed > breakpoints.maxFailedChecks
  ) {
    console.error(`Breakpoint test failed: Exceeded the maximum allowed failed checks.`);
  }

  console.log(`Breakpoint test passed on ${new Date().toLocaleDateString()}.`);
};


const runIcanWithArrivalRate = async (
  url,
  method = 'GET',
  numRequests = 1,
  targetArrivalRate = 1, // Set your target arrival rate in requests per second
  data = null,
  thresholds = {},
  durationTest = 0 // Tambahkan parameter durasi pengujian
) => {
  const metrics = new icanloadjs(thresholds);

  // Calculate the total number of Virtual Users needed based on the target arrival rate
  const totalVirtualUsers = Math.ceil(targetArrivalRate * numRequests);

  // Create a pool of Virtual Users
  const virtualUsers = Array.from({ length: totalVirtualUsers }, () => metrics.createVirtualUser());

  // Calculate the delay between each Virtual User's start time
  const delayBetweenUsers = 1000 / targetArrivalRate; // in milliseconds

  // Display the animation message "-------ICANLOADJS Arrival Rate Test-------" with loading animation
  const loadingAnimation = ['|', '/', '-', '\\'];
  let animationIndex = 0;
  const loadingInterval = setInterval(() => {
    process.stdout.write(`\rLoading ${loadingAnimation[animationIndex]} Running Arrival Rate Test...`);
    animationIndex = (animationIndex + 1) % loadingAnimation.length;
  }, 100);

  // Function to perform a request and track metrics for a single Virtual User
  const performRequestForUser = async (user) => {
    for (let i = 0; i < numRequests; i++) {
      await performHttpRequest(url, method, data, metrics, user);
      await sleepIcan(0, 0); // Adjust this delay if needed
    }
  };

  // Start each Virtual User with a delay between them
  await Promise.all(
    virtualUsers.map((user, index) => sleepIcan(index * delayBetweenUsers, index * delayBetweenUsers).then(() => performRequestForUser(user)))
  );

  clearInterval(loadingInterval);
  process.stdout.write('\r'); // Clear loading animation line

  const calculatedMetrics = metrics.calculateMetrics();
  calculatedMetrics.testDurationInSeconds = durationTest; // Tambahkan durasi pengujian ke dalam metrik

  console.log('----------ICANLOADJS----------');
  console.log(`Arrival Rate test completed for ${numRequests * totalVirtualUsers} requests by ${totalVirtualUsers} virtual users.`);
  console.log('Metrics:');
  console.log(calculatedMetrics);

  // Check if thresholds are defined before accessing their properties
  if (thresholds.maxFailedChecks && calculatedMetrics.checksFailed > thresholds.maxFailedChecks) {
    console.error(`Arrival Rate test failed: Exceeded the maximum allowed failed checks.`);
    process.exit(1);
  }

  // Additional matrix checks
  if (thresholds.http_req_failed && calculatedMetrics.checksFailedRate > thresholds.http_req_failed) {
    console.error(`Arrival Rate test failed: http_req_failed rate exceeded the allowed threshold.`);
    process.exit(1);
  }

  if (thresholds.http_req_duration && calculatedMetrics.percentileValue > thresholds.http_req_duration) {
    console.error(`Arrival Rate test failed: http_req_duration exceeded the allowed threshold.`);
    process.exit(1);
  }

  console.log(`Arrival Rate test passed on ${new Date().toLocaleDateString()}.`);
};


module.exports = {
  runIcan,
  runBreakpointIcan,
  sleepIcan,
  runIcanWithArrivalRate,
};