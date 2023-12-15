const fs = require('fs');
const path = require('path');
const icanloadjs = require('icanloadjs'); // Ganti dengan path yang sesuai ke skrip icanloadjs Anda

const convertPostmanToIcanloadJS = (collectionFile, environmentFile, icanloadjsScript) => {
  // Load Postman environment file
  const environmentData = JSON.parse(fs.readFileSync(environmentFile, 'utf8'));

  // Extract base URL from the environment file with nullish check
  const baseUrl = environmentData.values.find((v) => v.key === 'baseUrl')?.value;

  // Load Postman collection file
  const collectionData = JSON.parse(fs.readFileSync(collectionFile, 'utf8'));

  // Extract request details from the collection file
  const request = collectionData.item[0].request;

  // Check if request has a body
  const dataMode = request.body ? request.body.mode : null;

  // Assuming the request body mode is specified and dataMode is not null
  const data = dataMode === 'raw' ? request.body.raw : null; // Assuming raw body mode

  // Generate the icanloadjs script content
  const scriptContent = `
    const icanloadjs = require('${icanloadjsScript}');
    const method = '${request.method.toUpperCase()}';
    const numRequests = 1;
    const numVirtualUsers = 1;
    const thresholds = {
      maxFailedChecks: 1,
      http_req_failed: 0.01, // 1% failure rate
      http_req_duration: 200, // 95% of requests below 200ms
      // ... other thresholds
    };

    const data = ${data ? JSON.stringify(data) : 'null'}; // Include data if available

    icanloadjs.runIcan('${request.url.raw.replace('{{baseUrl}}', baseUrl)}', method, numRequests, numVirtualUsers, thresholds, data);
  `;

  // Save the generated script to a file
  const outputPath = path.join(__dirname, 'icanloadScript.js');
  fs.writeFileSync(outputPath, scriptContent, 'utf8');
  console.log(`The icanloadjs script has been generated and saved to: ${outputPath}`);
};

// Command-line arguments
const [collectionFile, environmentFile, icanloadjsScript] = process.argv.slice(2);

// Check if required arguments are provided
if (!collectionFile || !environmentFile || !icanloadjsScript) {
  console.error('Usage: node postmanToIcanloadJS.js <collectionFile> <environmentFile> <icanloadjsScript>');
  process.exit(1);
}

// Run the conversion script
convertPostmanToIcanloadJS(collectionFile, environmentFile, icanloadjsScript);

// Example : node postmanToIcanloadJS.js postmantoicanload.postman_collection.json fakeAPI.postman_environment.json icanloadjs
