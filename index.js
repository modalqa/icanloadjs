const https = require('https');

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
  
    return {
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
  virtualUser.incrementRequestCounter();
  metrics.incrementCounter();

  return new Promise((resolve, reject) => {
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
    let tokenFromResponse; // Variable untuk menyimpan token dari respons

    const req = https.request(url, options, (res) => {
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

          // Coba untuk mengambil token dari respons
          try {
            const responseData = JSON.parse(Buffer.concat(chunks).toString());
            tokenFromResponse = responseData.token; // Ganti 'token' dengan kunci yang sesuai pada respons API
          } catch (error) {
            console.error('Error parsing response data:', error.message);
          }
        } else {
          metrics.trackCheckFailed();
        }

        resolve({ elapsedTime, token: tokenFromResponse }); // Mengembalikan waktu respons dan token
      });
    });

    req.on('socket', (socket) => {
      socket.on('allocate', () => {
        socketAllocatedTime = Date.now();
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNRESET') {
        const timestamp = new Date().toLocaleTimeString(); // Mendapatkan timestamp saat terjadi kesalahan
        const errorMessage = `ECONNRESET or connection to the server is lost`;
        console.error(`Error: ${errorMessage} at ${timestamp}. Stopping the performance test.`);
        
        // Increment jumlah kesalahan ECONNRESET
        metrics.trackCheckFailed();
        
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
  console.error('Error in performHttpRequest:', error.message);
  throw error; // Re-throw the error to propagate it up the call stack
}
};

const runIcan = async (url, method = 'GET', numRequests = 1, numVirtualUsers = 1, data = null, thresholds = {}) => {
  const metrics = new icanloadjs(thresholds);

  const virtualUsers = Array.from({ length: numVirtualUsers }, () => metrics.createVirtualUser());

  const requests = virtualUsers.map((user) =>
    Array.from({ length: numRequests }, () => performHttpRequest(url, method, data, metrics, user))
  );

  // Display the animation message "-------ICANLOADJS-------" without delay
  console.log('----------ICANLOADJS----------');

  await Promise.all(requests.flat());

  const calculatedMetrics = metrics.calculateMetrics();

  console.log(`Performance test completed for ${numRequests * numVirtualUsers} requests by ${numVirtualUsers} virtual users.`);
  console.log('Metrics:');
  console.log(calculatedMetrics);

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
runBreakpointIcan = async (url, method = 'GET', numRequests = 1, numVirtualUsers = 1, data = null, breakpoints = {}) => {
  const metrics = new icanloadjs();

  const virtualUsers = Array.from({ length: numVirtualUsers }, () => metrics.createVirtualUser());

  const requests = virtualUsers.map((user) =>
    Array.from({ length: numRequests }, () => performHttpRequest(url, method, data, metrics, user))
  );

  console.log('----------ICANLOADJS Breakpoint Test----------');

  await Promise.all(requests.flat());

  const calculatedMetrics = metrics.calculateMetrics();

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

module.exports = {
  runIcan,
  runBreakpointIcan,
  sleepIcan,
};