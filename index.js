// performanceTestModule.js
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
      checksPassed: this.checksPassed, // Menambahkan jumlah pemeriksaan yang berhasil ke hasil metrik
      virtualUsers: this.virtualUsers.map((user) => ({
        requestCount: user.getRequestCount(),
      })),
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

const performHttpRequest = async (url, method = 'GET', data = null, metrics, virtualUser) => {
  virtualUser.incrementRequestCounter();
  metrics.incrementCounter();

  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.from(JSON.stringify(data)).length;
    }

    const startTime = Date.now();
    let socketAllocatedTime;

    const req = https.request(url, options, (res) => {
      res.on('data', (responseData) => {});
  
      res.on('end', () => {
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        metrics.trackValue(elapsedTime);
  
        if (socketAllocatedTime) {
          const waitingTime = startTime - socketAllocatedTime;
          metrics.trackSocketWaitTime(waitingTime);
        }
  
        // Menambahkan pemeriksaan sederhana: respon.status === 200
        if (res.statusCode === 200) {
          metrics.trackCheckPassed();
        } else {
          metrics.trackCheckFailed(); // Memanggil trackCheckFailed untuk pemeriksaan yang gagal
        }
  
        resolve(elapsedTime);
      });
    });
//
    req.on('socket', (socket) => {
      socket.on('allocate', () => {
        socketAllocatedTime = Date.now();
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

const runIcan = async (url, method = 'GET', numRequests = 1, numVirtualUsers = 1, data = null, thresholds = {}) => {
  const metrics = new icanloadjs(thresholds);

  const virtualUsers = Array.from({ length: numVirtualUsers }, () => metrics.createVirtualUser());

  const requests = virtualUsers.map((user) =>
    Array.from({ length: numRequests }, () => performHttpRequest(url, method, data, metrics, user))
  );

  await Promise.all(requests.flat());

  const calculatedMetrics = metrics.calculateMetrics();

  console.log(`Performance test completed for ${numRequests * numVirtualUsers} requests by ${numVirtualUsers} virtual users.`);
  console.log('Metrics:');
  console.log(calculatedMetrics);

  // Memeriksa ambang batas dan menentukan apakah pengujian berhasil atau gagal
  if (thresholds.maxFailedChecks && calculatedMetrics.checksFailed > thresholds.maxFailedChecks) {
    console.error(`Performance test failed: Exceeded the maximum allowed failed checks.`);
    process.exit(1); // Exit with a non-zero status code to indicate failure
  } else {
    console.log(`Performance test passed on ${new Date().toLocaleDateString()}.`);
  }
};



module.exports = {
  runIcan,
};
