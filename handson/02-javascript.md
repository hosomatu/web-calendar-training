# ハンズオン 02: JavaScript - クリックイベントと気分登録機能

## 概要

JavaScriptを使って、カレンダーの日付をクリックすると気分アイコンが登録できる「ニコニコカレンダー」を作ります。
DOM操作、イベントリスナー、localStorageを学びます。

## 前提知識

- ハンズオン01が完了していること(HTMLカレンダーが表示されている)
- ブラウザのDevTools(F12)のConsoleタブが開けること

## 課題

### 課題1: クリックした日付のセルに気分アイコンを登録できるようにする

クリックした日付のセルに気分アイコンを登録できるようにしてください。(ニコニコカレンダー)
データの保存は不要です。ブラウザリロードしたら消える、という仕様でも問題ありません。

**実装は自由です。** 以下は一例として、クリックするたびにアイコンが順番に切り替わる方式で解説しています。

### ステップ1: JavaScriptファイルの読み込み

HTMLの `</body>` 直前に `<script>` タグを追加します。

```html
  <script src="javascript/global.js"></script>
</body>
```

**なぜ `</body>` の直前に置くのか？**

`<head>` に書くと、HTMLのDOM要素が読み込まれる前にJSが実行されます。
その時点ではまだ `<td>` が存在しないため、要素を取得できません。

参考: [HTMLの<script>を書く位置について](https://zenn.dev/zenn_rr/articles/46c7b83fa4aa48)

### ステップ2: HTML側の準備

各日付セルに気分表示用の `<div>` を追加します。

```html
<td>26<div class="kibun">気分を登録</div></td>
```

### ステップ3: DOM要素の取得

```javascript
const calendarCells = document.querySelectorAll("td");
```

- `document.querySelectorAll("td")` → ページ内の全 `<td>` 要素を取得
- 返り値は **NodeList** (配列に似ているが別物。`forEach` は使えるが `map` や `filter` は使えない)

参考: [Document: querySelectorAll() - Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/Document/querySelectorAll)

### ステップ4: イベントリスナーの登録

```javascript
calendarCells.forEach((cell) => {
  cell.addEventListener("click", selectKibun);
});
```

**重要ポイント:**

- `addEventListener` は **EventTarget** インターフェースのメソッド
- NodeListには `addEventListener` が使えないので、`forEach` で各要素に個別に登録する
- `selectKibun` に括弧を付けない → 関数の**参照**を渡す(実行ではない)

```javascript
// ❌ 括弧付き → その場で実行してしまう
cell.addEventListener("click", selectKibun());

// ✅ 括弧なし → 関数の参照を渡す
cell.addEventListener("click", selectKibun);
```

参考: [EventTarget: addEventListener() - Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener)

### ステップ5: イベントハンドラの実装

```javascript
function selectKibun(event) {
  const td = event.currentTarget;
  const selectedDayKibun = td.querySelector(".kibun");
  // ...
}
```

- `event` → ブラウザが自動で渡すイベントオブジェクト
- `event.currentTarget` → イベントリスナーが登録された要素(常に `<td>`)
- `event.target` → 実際にクリックされた要素(子要素の `<div>` かもしれない)

`currentTarget` を使う理由: セル内のどこをクリックしても確実に `<td>` を取得するため。

参考: [Element: click イベント - Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/Element/click_event)

### ステップ6: 気分の切り替えロジック

```javascript
const DEFAULT_KIBUN = '気分を登録';
const KIBUN_ICONS = ['😊', '😎', '😭', '🏃‍♂️'];

function selectKibun(event) {
  const td = event.currentTarget;
  const selectedDayKibun = td.querySelector(".kibun");
  const currentKibunIndex = KIBUN_ICONS.indexOf(selectedDayKibun.textContent);

  let nextKibun;
  if (currentKibunIndex === -1) {
    nextKibun = KIBUN_ICONS[0];
  } else if (currentKibunIndex === KIBUN_ICONS.length - 1) {
    nextKibun = DEFAULT_KIBUN;
  } else {
    nextKibun = KIBUN_ICONS[currentKibunIndex + 1];
  }

  selectedDayKibun.textContent = nextKibun;
}
```

- `indexOf` → 配列内の要素の位置を返す。見つからなければ `-1`
- `===` → 厳密等価演算子(型変換なしで比較)。JSでは常にこちらを使う

---

### 課題2(発展): localStorageで気分を保存する

ローカルストレージを活用することで、リロードしても気分が消えないようにしてください。

### ステップ1: HTMLにdata属性を追加

各セルに一意のキーを持たせます。

```html
<td data-day="0501">1<div class="kibun">気分を登録</div></td>
```

- `data-*` → HTMLの正式な仕様で「カスタムデータ属性」と呼ばれる
- JSからは `element.dataset.day` でアクセスできる
- 見た目やブラウザの動作には影響しない。純粋にJSからデータを読み取るための仕組み

参考: [HTML data-* グローバル属性 - HTML | MDN](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Global_attributes/data-*)

### ステップ2: 気分選択時に保存

```javascript
selectedDayKibun.textContent = nextKibun;
localStorage.setItem(clickedCell.dataset.day, nextKibun);
```

参考: [Window: localStorage - Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage)

### ステップ3: ページ読み込み時に復元

```javascript
calendarCells.forEach((cell) => {
  cell.addEventListener("click", selectKibun);

  const kibun = cell.querySelector(".kibun");
  if (!localStorage.getItem(cell.dataset.day)) {
    kibun.textContent = DEFAULT_KIBUN;
  } else {
    kibun.textContent = localStorage.getItem(cell.dataset.day);
  }
});
```

---

## 学んだこと チェックリスト

- [ ] `<script>` タグの配置場所と理由
- [ ] `document.querySelectorAll` でDOM要素を取得する方法
- [ ] NodeListと配列の違い
- [ ] `addEventListener` でイベントを登録する方法
- [ ] イベントオブジェクト(`event.target` vs `event.currentTarget`)
- [ ] `textContent` でDOM要素のテキストを読み書きする方法
- [ ] `data-*` カスタムデータ属性の使い方
- [ ] `localStorage` によるデータの永続化

