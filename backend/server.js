const http = require('http');
const fs = require('fs');
const url = require('url');

const server = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const query = parsedUrl.query;

  const now = new Date();
  const year = query.year ? parseInt(query.year) : now.getFullYear();
  const month = query.month ? parseInt(query.month) : now.getMonth() + 1;

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  let calendarBody = '';
  let dayCount = 1;

  for (let week = 0; dayCount <= daysInMonth; week++) {
    calendarBody += '<tr>';

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      if ((week === 0 && dayOfWeek < firstDayOfWeek) || daysInMonth < dayCount) {
        calendarBody += '<td></td>';
      } else {
        calendarBody += `<td>${dayCount}</td>`;
        dayCount++;
      }
    }

    calendarBody += '</tr>';
  }

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const calendarNav = `
    <a href="/?year=${prevYear}&month=${prevMonth}">← 前の月</a>
    <a href="/">今月</a>
    <a href="/?year=${nextYear}&month=${nextMonth}">次の月 →</a>
  `;

  const htmlPath = '/content/index.html';
  let html = fs.readFileSync(htmlPath, 'utf-8');
  html = html.replace('{{CALENDAR_TITLE}}', `${year}年${month}月のカレンダー`);
  html = html.replace('{{CALENDAR_BODY}}', calendarBody);
  html = html.replace('{{CALENDAR_NAV}}', calendarNav);

  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(html);
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
