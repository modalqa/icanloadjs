//Contoh Basic Auth
const icanloadjs = require('icanloadjs');

// Contoh URL yang akan diuji
const urlToTest = 'https://fakestoreapi.com/auth/login';
const method = 'POST';

// Menjalankan uji kinerja dengan otentikasi dasar
const numRequests = 1;
const numVirtualUsers = 2;

const auth = {
  type: 'basic',
  username: 'mor_2314',
  password: '83r5^_',
};

icanloadjs.runIcan(urlToTest, method, numRequests, numVirtualUsers, auth);