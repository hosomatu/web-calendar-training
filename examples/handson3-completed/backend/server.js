const http = require('http');
const fs = require('fs');

const server = http.createServer((request, response) => {
  const htmlPath = '/content/index.html';
  const html = fs.readFileSync(htmlPath, 'utf-8');

  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(html);
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
