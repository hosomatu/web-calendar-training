const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((reqest, response) =>{
  const htmlPath = path.join(__dirname, '../content/index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');

  response.writeHead(200, { 'Content-Type': 'text/html; charset=ytf-8'});
  response.end(html);
})

server.listen(3000, () => {
  console.log('Server is runnning on port 3000');
})
