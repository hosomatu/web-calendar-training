# ハンズオン 04: Backend(動的生成) - カレンダーの動的生成と月移動

## 概要

ハンズオン03で構築したNode.jsサーバーを使い、カレンダーのHTMLをforループで動的に生成します。
さらにクエリパラメータで月を移動できるナビゲーション機能を実装します。

## 前提知識

- ハンズオン03が完了していること(Node.js + nginx構成が動作している)

---

## 課題

### 課題1: カレンダーのタイトルを動的に生成する

HTMLの `<caption>` をプレースホルダーに変更し、サーバー側で現在の年月を差し込みます。

### ステップ1: HTMLにプレースホルダーを設置する

**content/index.html:**
```html
<caption>
  {{CALENDAR_TITLE}}
</caption>
```

### ステップ2: server.jsで置換する

```javascript
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

let html = fs.readFileSync(htmlPath, 'utf-8');
html = html.replace('{{CALENDAR_TITLE}}', `${currentYear}年${currentMonth}月のカレンダー`);
```

- `new Date()` → 現在日時を取得
- `getFullYear()` → 年を取得(例: 2026)
- `getMonth() + 1` → 月を取得(0始まりなので+1が必要)
- `html.replace('{{CALENDAR_TITLE}}', ...)` → HTMLのプレースホルダーを動的な値に置換

**補足: `Date` は `require` なしで使えるのはなぜ？**

`Date` はJavaScript言語自体に組み込まれたグローバルなクラスです。`http` や `fs` はNode.js固有のモジュールなので `require` が必要ですが、`Date`, `Math`, `Array`, `JSON` などはどの環境(ブラウザでもNode.jsでも)でも最初から使えます。

なお、同じグローバルでも `Date` と `Math` は性質が異なります。`Date` はクラスなので `new Date()` でインスタンスを作り、そのインスタンスが「特定の日時」という状態を保持します。一方 `Math` はクラスではなく `{PI: 3.14, floor: function(){...}}` のようなただのオブジェクトで、状態を持たず `Math.floor(3.7)` のように直接メソッドを呼びます。

なお、Node.js 26以降では `Date` の後継として `Temporal` APIが標準で使えるようになっています。`Date` は月が0始まりだったり設計上の問題が多いため、今後は `Temporal` への移行が進む見込みです。今回はNode.js 22を使用しているため `Date` を使っています。

**ゴール:** カレンダーのタイトルがサーバー側で動的に生成されていること。

---

### 課題2: カレンダーの日付部分をforループで動的に生成する

HTMLにハードコードしていた日付のセル(`<td>`)を、Node.js側でforループを使って生成するようにします。

**要件:**
- 当月の日数を計算してテーブルを組み立てること
- 月の開始曜日を計算して正しい位置に日付を配置すること
- HTMLの `<tbody>` 部分をforループで生成すること

### ステップ1: 月の日数と開始曜日を計算する

```javascript
const daysInMonth = new Date(year, month, 0).getDate();
const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
```

- `new Date(year, month, 0)` → 「翌月の0日目」=「当月の最終日」というトリック
- `.getDate()` → 日付を取得(この場合は最終日 = 日数)
- `.getDay()` → 曜日を数値で取得(0=日曜, 1=月曜, ..., 6=土曜)

参考: [Date() コンストラクター - MDN](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/Date)

### ステップ2: forループでHTMLを組み立てる

```javascript
let calendarBody = '';
let dayCount = 1;

for (let week = 0; dayCount <= daysInMonth; week++) {
  calendarBody += '<tr>';

  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    if ((week === 0 && dayOfWeek < firstDayOfWeek) || dayCount > daysInMonth) {
      calendarBody += '<td></td>';
    } else {
      calendarBody += `<td>${dayCount}</td>`;
      dayCount++;
    }
  }

  calendarBody += '</tr>';
}
```

### ステップ3: プレースホルダーで差し込む

**content/index.html:**
```html
<tbody>
  {{CALENDAR_BODY}}
</tbody>
```

**backend/server.js:**
```javascript
html = html.replace('{{CALENDAR_BODY}}', calendarBody);
```

**ゴール:** HTMLに日付をハードコードせず、サーバー側で当月のカレンダーが自動生成されること。

---

### 課題3: クエリパラメータで月を移動できるようにする

URLにクエリパラメータ(`?year=2026&month=3`)を付けることで、任意の月のカレンダーを表示できるようにします。

**要件:**
- 初回アクセス(`/`)は当月のカレンダーを表示する
- `/?year=2026&month=3` で2026年3月のカレンダーを表示する
- 「前の月」「次の月」リンクを設置してクリックで月移動できる
- 「今月」リンクを設置してクリックで当月に戻れる

### ステップ1: クエリパラメータを取得する

```javascript
const url = require('url');

const server = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const query = parsedUrl.query;

  const now = new Date();
  const year = query.year ? parseInt(query.year) : now.getFullYear();
  const month = query.month ? parseInt(query.month) : now.getMonth() + 1;
  // ...
});
```

- `url.parse(request.url, true)` → URLを解析してクエリパラメータをオブジェクトとして取得
- `query.year` → `?year=2026` の `2026` を取得(文字列なので `parseInt` で数値に変換)
- パラメータがなければ現在の年月を使う

参考: [URL | Node.js Documentation](https://nodejs.org/api/url.html)

### ステップ2: 前月・次月・今月リンクを生成する

```javascript
const prevMonth = month === 1 ? 12 : month - 1;
const prevYear = month === 1 ? year - 1 : year;
const nextMonth = month === 12 ? 1 : month + 1;
const nextYear = month === 12 ? year + 1 : year;

const calendarNav = `
  <a href="/?year=${prevYear}&month=${prevMonth}">← 前の月</a>
  <a href="/">今月</a>
  <a href="/?year=${nextYear}&month=${nextMonth}">次の月 →</a>
`;
```

HTMLにナビゲーション用のプレースホルダー(`{{CALENDAR_NAV}}`)を追加して置換します。

```javascript
html = html.replace('{{CALENDAR_NAV}}', calendarNav);
```

### ステップ3: 動作確認

```sh
docker compose restart
open http://localhost:8080
open http://localhost:8080/?year=2026&month=3
```

- `/` → 今月のカレンダーが表示される
- `/?year=2026&month=3` → 2026年3月のカレンダーが表示される
- 「← 前の月」「次の月 →」リンクで月移動できる
- 「今月」リンクで当月に戻れる

**ゴール:** URLのクエリパラメータに応じて任意の月のカレンダーが表示でき、リンクで月を移動できること。

---

## 学んだこと チェックリスト

- [ ] `Date` を使った日付計算(日数、曜日)
- [ ] forループによるHTML動的生成
- [ ] プレースホルダーによるテンプレート方式
- [ ] クエリパラメータの取得と利用(`url.parse`)
- [ ] 三項演算子による条件分岐
- [ ] ナビゲーションリンクの動的生成
