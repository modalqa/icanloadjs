
<img src="https://github.com/modalqa/icanloadjs/raw/main/media/IcanLoadJS-logo.png" alt="icanloadjs Logo" width="200" height="200" style="display:block; margin:auto;">

# icanloadjs: Simple and Powerful Node.js Performance Testing

[![npm version](https://img.shields.io/npm/v/icanloadjs.svg)](https://www.npmjs.com/package/icanloadjs)

## Overview
`icanloadjs` is a lightweight and flexible performance testing tool designed for Node.js applications. Whether you're testing APIs, web services, or backend processes, icanloadjs empowers you to measure and analyze the performance of your system under various scenarios.

## Features

- **Easy-to-Use:** Get started quickly with a simple and intuitive interface. Define your test parameters and let icanloadjs handle the rest.

- **HTTP Methods Support:** Test a wide range of HTTP methods, including GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD, and more. Customize your requests to simulate real-world scenarios.

- **Virtual Users:** Simulate concurrent users with virtual users, each tracking their individual request counts, providing a comprehensive view of system performance.

- **Metrics and Analysis:** Gain valuable insights into your system's performance with built-in metrics, including response times, request counts, min/max values, and custom metrics.

- **Checks and Validations:** Implement checks to validate responses, ensuring that your system meets specific criteria. Track the number of successful and failed checks during testing.

- **Thresholds and Exit Conditions:** Set performance thresholds and exit conditions to automatically determine the success or failure of your tests. Define maximum failed checks and other criteria to ensure reliability.

- **Arrival Rate:** is designed to test system performance by allowing you to control the arrival rate of requests from virtual users. Arrival rate is the number of requests that arrive per unit time, usually measured in requests per second.

Situations where you might need to use runIcanWithArrivalRate:
- Peak Load Testing: You want to see how your system responds when there are high spikes in demand, such as during flash sales or special promotional periods.
- Daily Traffic Pattern Simulation: You want to test system performance at certain times of the day, for example, at the start of the work day or during peak hours.
- System Scalability: You want to evaluate the system's ability to handle significant traffic fluctuations and ensure that resources can be allocated efficiently.

- **Date-Stamped Results:** Keep track of when your performance tests were successful. The tool automatically logs the test completion date for easy reference.

## Getting Started

1. Install icanloadjs using npm: `npm i icanloadjs`
2. Create a simple test script to define your test scenarios.
3. Run your performance tests: `node your_test_script.js`

## Example Test Script

```javascript
const icanloadjs = require('icanloadjs');

const urlToTest = 'https://balsam-loving-legal.glitch.me/users';
const method = 'GET';
const numRequests = 1;
const numVirtualUsers = 1;

icanloadjs.runIcan(urlToTest, method);
```
## Metric
1. checksFailed: The number of checks that failed during the performance test. Checks may include validation of response code status, data format, or other conditions specified in the test scenario.
2. counter: The total number of requests made during the performance test. This includes both successful and failed requests.
3. totalRequests: The total number of successful requests during the performance test. This only includes requests that are successful and pass the specified checks.
4. minValue: The minimum response time value of all successful requests during the performance test.
5. maxValue: The maximum response time value of all successful requests during the performance test.
6. nonZeroCount: The number of requests that have a non-zero response time. It measures how many requests were successful.
7. sum: The total response time of all successful requests during the performance test.
8. averageValue: The average response time value of all successful requests during the performance test.
9. modeValue: The response time mode value of all successful requests during the performance test. The mode is the value that occurs most frequently.
10. percentileValue: Response time percentile values, specifically the 50th percentile (median) of all successful requests during a performance test.
11. socketWaitTime: Total socket waiting time during performance test. This measures how long an application must wait for a socket before it can make an HTTP request.
12. checksPassed: The number of successful checks during the performance test.
13. virtualUsers: An array of objects representing each virtual user. Each object includes the number of requests made by that user.
14. sentDataSize: The total size of data sent during the performance test.
15. receivedDataSize: The total size of data received during the performance test.

These metrics provide a complete picture of system performance, including the distribution of response times, the number of successful requests, failed checks, and the size of data sent and received. By monitoring and understanding these metrics, you can identify areas where system performance can be improved or where improvements are needed.

## Example Test Result

<img src="https://github.com/modalqa/icanloadjs/raw/main/media/icanloadjs-result.png" alt="icanloadjs Result" width="300" height="200">

