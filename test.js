const fs = require('fs');
const path = require('path');

// Membaca semua file di folder "test" dengan ekstensi ".test.js"
const testFiles = fs.readdirSync(path.join(__dirname, 'test'))
  .filter(file => file.endsWith('.test.js'));

// Menjalankan setiap file tes
testFiles.forEach(testFile => {
  const fullPath = path.join(__dirname, 'test', testFile);
  console.log(`Running tests from: ${fullPath}`);

  // Melakukan impor dan menjalankan skrip tes
  require(fullPath);
});
