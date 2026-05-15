const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((reqest, response) =>{
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth-1, 1).getDay();

  let calendarBody = '';
  let dayCount = 1;

  for (let week =0; dayCount <= daysInMonth; week++) {
    calendarBody += '<tr>';

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek ++) {
      if ((week === 0 && dayOfWeek < firstDayOfWeek) || daysInMonth < dayCount) {
        calendarBody += '<td></td>';
      } else {
        calendarBody += `<td>${dayCount}</td>`;
        dayCount++;
      }
    }

    calendarBody += '</tr>';
  }

  const htmlPath = '/content/index.html';
  let html = fs.readFileSync(htmlPath, 'utf-8');
  html = html.replace('{{CALENDAR_TITLE}}', `${currentYear}年${currentMonth}月のカレンダー`)

  response.writeHead(200, { 'Content-Type': 'text/html; charset=ytf-8'});
  response.end(html);
})

server.listen(3000, () => {
  console.log('Server is runnning on port 3000');
})
