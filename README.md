# icanloadjs: Simple and Powerful Node.js Performance Testing

<img src="https://github.com/modalqa/icanloadjs/raw/main/media/IcanLoadJS-logo.png" alt="icanloadjs Logo" width="100" height="100">

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

- **Date-Stamped Results:** Keep track of when your performance tests were successful. The tool automatically logs the test completion date for easy reference.

## Getting Started

1. Install icanloadjs using npm: `npm install -g icanloadjs`
2. Create a simple test script to define your test scenarios.
3. Run your performance tests: `icanloadjs your_test_script.js`

## Example Test Script

```javascript
const icanloadjs = require('icanloadjs');

const urlToTest = 'https://balsam-loving-legal.glitch.me/users';
const method = 'GET';
const numRequests = 1;
const numVirtualUsers = 1;

icanloadjs.runPerformanceTest(urlToTest, method, numRequests, numVirtualUsers);
```
## Example Test Result

<img src="https://github.com/modalqa/icanloadjs/raw/main/media/icanloadjs-result.png" alt="icanloadjs Result" width="300" height="200">


