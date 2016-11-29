const Path = require('path');
const FS = require('fs');
const grpc = require('grpc');
var ssl_creds = grpc.credentials.createSsl(FS.readFileSync(Path.join(__dirname, '../server.pem')));

console.log(ssl_creds)