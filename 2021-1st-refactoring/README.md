# 코드 보는 순서

1. chapter1.js
2. chapter1-1.js
3. chapter1-2-\*.js
4. chapter1-3-\*.js

---

# Chapter 1: 리팩터링과 예시

### 1챕터는 예시를 듦

'다양한 연극을 외주로 받아 공연하는 극단이 있는데, 연극 장르와 관객 규모를 기초로 비용을 정합니다. 현재 이 극단은 비극과 희극만 공연하고, 공연료와는 별개로 포인트라는 것을 지급해, 다음 의뢰에 공연료를 할인받게 해주는 프로그램'으로 리팩터링 진행

데이터셋

```json
// invoices.json
{
  "customer": "BigCo",
  "performances": [
      {
          "playID": "hamlet",
          "audience": 55
      },
      {
          "playID": "as-like",
          "audience": 35
      },
      {
          "playID": "othello",
          "audience": 40
      }
  ]
}
// plays.json
{
    "hamlet": { "name": "Hamlet", "type": "tragedy"},
    "as-like": { "name": "As You Like It", "type": "comedy"},
    "othello": { "name": "Othello", "type": "tragedy"}
}
```

```javascript
const invoices = require("./invoices.json");
const plays = require("./plays.json");

function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;
  const format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format;

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    let thisAmount = 0;

    switch (play.type) {
      case "tragedy":
        thisAmount = 40000;
        if (perf.audience > 30) {
          thisAmount += 1000 * (perf.audience - 30);
        }
        break;
      case "comedy":
        thisAmount = 30000;
        if (perf.audience > 20) {
          thisAmount += 10000 + 500 * (perf.audience - 20);
        }
        thisAmount += 300 * perf.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${play.type}`);
    }

    // 포인트를 적립합니다.
    volumeCredits += Math.max(perf.audience - 30, 0);
    // 코미디 관객 5명마다 추가 포인트를 제공합니다.
    if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);

    result += `  ${play.name}: ${format(thisAmount / 100)} (${
      perf.audience
    }석)\n`;
    totalAmount += thisAmount;
  }

  result += `총액: ${format(totalAmount / 100)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;
  return result;
}

console.log(statement(invoices, plays));
/*
 * 청구 내역 (고객명: BigCo)
 *  Hamlet: $6.50 (55석)
 *  As You Like It: $5.80 (35석)
 *  Othello: $5.00 (40석)
 * 총액: $1,730.00
 * 적립 포인트: 47점
 */
```

- 이 함수 하나만 놓고보면 엄청 나쁜 코드는 아님.
- 하지만 저희가 작업하고 있는 코드베이스는 엄청난 라인 수를 가지고 있음
- 모두의 생산성을 위해 좀 더 깔끔한 형태를 할 필요가 있음

그리고 이 함수는 요청사항이 들어오면 더욱 더 복잡해질 것입니다.

다음과 같은 요청사항이 들어온다면 어떻게 될까?

1. HTML로 출력하는 기능이 필요해요! (여러 형태로 출력하는 기능이 있을 수 있음)
2. 향후 여러 장르를 선택할 수 있어야됨 (공연료, 적립 포인트 계산법에 영향 줌)

편한 구조로 리팩터링 후 위의 요청사항을 구현할 거임

---

### 1. 기능을 추가하기 쉬운 형태로 리팩터링 하기

1. statement()를 쪼갤 것
2. 전체 동작을 각각 나눌 수 있는 지점을 찾고 쪼갬
   1. 로컬 변수는 최대한 없앰 (어차피 결국 출력만 해주면 되서 변수를 선언할 필요는 없다!)

### 1-1. 과정

- for문안에 있는 switch문을 제거하기(amountFor로 만들어줌)
- 적립포인트 계산 코드 추출하기
- format 변수 제거하기
- volumeCredits 변수 제거하기
- totalAmount 변수 제거하기

위 과정을 거칠때마다 테스트를 진행해 잘 되가고 있나 확인 함 (어떨 때는 한 줄 바꾸고 테스트 돌림)

결과물

```javascript
const invoices = require("./invoices.json");
const plays = require("./plays.json");

function statement(invoice, plays) {
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;
  for (let perf of invoice.performances) {
    result += `  ${playFor(perf).name}: ${usd(amountFor(perf) / 100)} (${
      perf.audience
    }석)\n`;
  }
  result += `총액: ${usd(totalAmount())}\n`;
  result += `적립 포인트: ${totalVolumeCredits()}점\n`;

  return result;

  function totalAmount() {
    let result = 0;
    for (let perf of invoice.performances) {
      result += amountFor(perf);
    }
    return result;
  }
  function amountFor(aPerformance) {
    let result = 0;
    switch (playFor(aPerformance).type) {
      case "tragedy":
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case "comedy":
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`);
    }
    return result;
  }
  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  function totalVolumeCredits() {
    let result = 0;
    for (let perf of invoice.performances) {
      result += volumeCreditsFor(perf);
    }
    return result;
  }
  function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ("comedy" === playFor(aPerformance).type)
      result += Math.floor(aPerformance.audience / 5);
    return result;
  }

  function usd(aNumber) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(aNumber / 100);
  }
}

console.log(statement(invoices, plays));
```

---

### 계산 단계와 포맷팅 단계 분리하기

두 단계로 분리하면서 html로 렌더링 하는 기능 구현

```javascript
// statement.js
const createStatementData = require("./createStatementData.js");
const invoices = require("./invoices.json");
const plays = require("./plays.json");

function statement(invoice, plays) {
  return renderPlainText(createStatementData(invoice, plays));
}

function renderPlainText(data) {
  let result = `청구 내역 (고객명: ${data.customer})\n`;
  for (let perf of data.performances) {
    // 청구 내역을 출력한다.
    result += `  ${perf.play.name}: ${usd(perf.amount / 100)} (${
      perf.audience
    }석)\n`;
  }
  result += `총액: ${usd(data.totalAmount)}\n`;
  result += `적립 포인트: ${data.totalVolumeCredits}점\n`;
  return result;
}

/**
 * HTML STATEMENT
 */
function htmlStatement(invoice, plays) {
  return renderHtml(createStatementData(invoice, plays));
}

function renderHtml(data) {
  let result = `<h1>청구 내역 (고객명 ${data.customer})</h1>`;
  result += "<table>\n";
  result += "<tr><th>연극</th><th>좌석 수</th><th>금액</th></tr>";
  for (let perf of data.performances) {
    result += `    <tr><td>${perf.play.name}</td><td>(${perf.audience}석)</td`;
    result += `<td>${usd(perf.amount)}</td></tr>\n`;
  }
  result += "</table>\n";
  result += `<p>총액: <em>${usd(data.totalAmount)}</em></p>\n`;
  result += `<p>적립 포인트: <em>${data.totalVolumeCredits}</em>점</p>\n`;

  return result;
}

function usd(aNumber) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(aNumber / 100);
}

const invoices = require("./invoices.json");
const plays = require("./plays.json");
console.log(statement(invoices, plays));
```

```javascript
// createStatementData.js
export function createStatementData(invoice, plays) {
  const result = {};
  result.customer = invoice.customer;
  result.performances = invoice.performances.map(enrichPerformance);
  result.totalAmount = totalAmount(result);
  result.totalVolumeCredits = totalVolumeCredits(result);
  return result;

  function enrichPerformance(aPerformance) {
    const result = Object.assign({}, aPerformance);
    result.play = playFor(result);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(volumeCredits);
    return result;
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  function amountFor(aPerformance) {
    let result = 0;
    switch (playFor(aPerformance).type) {
      case "tragedy":
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case "comedy":
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`);
    }
    return result;
  }

  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0);
  }

  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
  }
}

module.exports = createStatementData;
```

---

### 연극 장르 추가와 계산 단계 코드 재구성

결과물

```javascript
// createStatementData.js
function createPerformanceCalculator(aPerformance, aPlay) {
  switch (aPlay.type) {
    case "tragedy":
      return new TragedyCalculator(aPerformance, aPlay);
    case "comedy":
      return new ComedyCalculator(aPerformance, aPlay);
    default:
      throw new Error(`알 수 없는 장르: ${aPlay}`);
  }
}

class PerformanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performance = aPerformance;
    this.play = aPlay;
  }

  get amount() {
    throw new Error("서브 클래스에서 처리하도록 설계되었습니다.");
  }

  get volumeCredits() {
    return Math.max(this.performance.audience - 30, 0);
  }
}

class TragedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 40000;
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30);
    }
    return result;
  }
}

class ComedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 30000;
    if (this.performance.audience > 20) {
      result += 10000 + 500 * (this.performance.audience - 20);
    }
    result += 300 * this.performance.audience;
    return result;
  }

  get volumeCredits() {
    return super.volumeCredits + Math.floor(this.performance.audience / 5);
  }
}

function createStatementData(invoice, plays) {
  const result = {};
  result.customer = invoice.customer;
  result.performances = invoice.performances.map(enrichPerformance);
  result.totalAmount = totalAmount(result);
  result.totalVolumeCredits = totalVolumeCredits(result);
  return result;

  function enrichPerformance(aPerformance) {
    // 생성자 대신 팩터리 함수 이용
    const calculator = createPerformanceCalculator(
      aPerformance,
      playFor(aPerformance)
    );

    const result = Object.assign({}, aPerformance);
    result.play = calculator.play;
    result.amount = calculator.amount;
    result.volumeCredits = calculator.volumeCredits;
    return result;
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0);
  }

  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
  }
}

module.exports = createStatementData;

// statement.js 변동사항 없음
```

`조건부 로직을 다형성으로 바꿔주기` 로 기존의 amountFor함수의 스위치문으로 요금을 계산해주던걸 팩토리 메소드 형식으로 추상화시켜 요금을 계산하고 있음

- 이렇게 함으로써 여러 장르가 추가될 때마다 간단히 넣을 수 있게 됨
- 장르마다의 가격 계산도 간단하게 이뤄질 수 있음

### 되짚어보기

지금까지 우리가 했던 것들입니다.

```json
// 데이터 셋
// invoiecs.json
{
  "customer": "BigCo",
  "performances": [
      {
          "playID": "hamlet",
          "audience": 55
      },
      {
          "playID": "as-like",
          "audience": 35
      },
      {
          "playID": "othello",
          "audience": 40
      }
  ]
}

// plays.json
{
  "hamlet": { "name": "Hamlet", "type": "tragedy"},
  "as-like": { "name": "As You Like It", "type": "comedy"},
  "othello": { "name": "Othello", "type": "tragedy"}
}
```

```javascript
// BEFORE
const invoices = require("./invoices.json");
const plays = require("./plays.json");

function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;
  const format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format;

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    let thisAmount = 0;

    switch (play.type) {
      case "tragedy":
        thisAmount = 40000;
        if (perf.audience > 30) {
          thisAmount += 1000 * (perf.audience - 30);
        }
        break;
      case "comedy":
        thisAmount = 30000;
        if (perf.audience > 20) {
          thisAmount += 10000 + 500 * (perf.audience - 20);
        }
        thisAmount += 300 * perf.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${play.type}`);
    }

    volumeCredits += Math.max(perf.audience - 30, 0);
    if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);

    result += `  ${play.name}: ${format(thisAmount / 100)} (${
      perf.audience
    }석)\n`;
    totalAmount += thisAmount;
  }

  result += `총액: ${format(totalAmount / 100)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;
  return result;
}

console.log(statement(invoices, plays));
/*
 * 청구 내역 (고객명: BigCo)
 *  Hamlet: $6.50 (55석)
 *  As You Like It: $5.80 (35석)
 *  Othello: $5.00 (40석)
 * 총액: $1,730.00
 * 적립 포인트: 47점
 */
```

```javascript
// AFTER
// createStatementData.js
function createPerformanceCalculator(aPerformance, aPlay) {
  switch (aPlay.type) {
    case "tragedy":
      return new TragedyCalculator(aPerformance, aPlay);
    case "comedy":
      return new ComedyCalculator(aPerformance, aPlay);
    default:
      throw new Error(`알 수 없는 장르: ${aPlay}`);
  }
}

class PerformanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performance = aPerformance;
    this.play = aPlay;
  }

  get amount() {
    throw new Error("서브 클래스에서 처리하도록 설계되었습니다.");
  }

  get volumeCredits() {
    return Math.max(this.performance.audience - 30, 0);
  }
}

class TragedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 40000;
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30);
    }
    return result;
  }
}

class ComedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 30000;
    if (this.performance.audience > 20) {
      result += 10000 + 500 * (this.performance.audience - 20);
    }
    result += 300 * this.performance.audience;
    return result;
  }

  get volumeCredits() {
    return super.volumeCredits + Math.floor(this.performance.audience / 5);
  }
}

function createStatementData(invoice, plays) {
  const result = {};
  result.customer = invoice.customer;
  result.performances = invoice.performances.map(enrichPerformance);
  result.totalAmount = totalAmount(result);
  result.totalVolumeCredits = totalVolumeCredits(result);
  return result;

  function enrichPerformance(aPerformance) {
    // 생성자 대신 팩터리 함수 이용
    const calculator = createPerformanceCalculator(
      aPerformance,
      playFor(aPerformance)
    );

    const result = Object.assign({}, aPerformance);
    result.play = calculator.play;
    result.amount = calculator.amount;
    result.volumeCredits = calculator.volumeCredits;
    return result;
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0);
  }

  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
  }
}

module.exports = createStatementData;

// AFTER
// statement.js
const createStatementData = require("./createStatementData");
const invoices = require("./invoices.json");
const plays = require("./plays.json");

function statement(invoice, plays) {
  return renderPlainText(createStatementData(invoice, plays));
}

function renderPlainText(data) {
  let result = `청구 내역 (고객명: ${data.customer})\n`;
  for (let perf of data.performances) {
    // 청구 내역을 출력한다.
    result += `  ${perf.play.name}: ${usd(perf.amount / 100)} (${
      perf.audience
    }석)\n`;
  }
  result += `총액: ${usd(data.totalAmount)}\n`;
  result += `적립 포인트: ${data.totalVolumeCredits}점\n`;
  return result;
}

/**
 * HTML STATEMENT
 */
function htmlStatement(invoice, plays) {
  return renderHtml(createStatementData(invoice, plays));
}

function renderHtml(data) {
  let result = `<h1>청구 내역 (고객명 ${data.customer})</h1>`;
  result += "<table>\n";
  result += "<tr><th>연극</th><th>좌석 수</th><th>금액</th></tr>";
  for (let perf of data.performances) {
    result += `    <tr><td>${perf.play.name}</td><td>(${perf.audience}석)</td`;
    result += `<td>${usd(perf.amount)}</td></tr>\n`;
  }
  result += "</table>\n";
  result += `<p>총액: <em>${usd(data.totalAmount)}</em></p>\n`;
  result += `<p>적립 포인트: <em>${data.totalVolumeCredits}</em>점</p>\n`;

  return result;
}

function usd(aNumber) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(aNumber / 100);
}

console.log(statement(invoices, plays));
/*
 * 청구 내역 (고객명: BigCo)
 *  Hamlet: $6.50 (55석)
 *  As You Like It: $5.80 (35석)
 *  Othello: $5.00 (40석)
 * 총액: $1,730.00
 * 적립 포인트: 47점
 */
```

리팩터링된 코드들은 이제 아래와 같은 기능을 편하게 구현 할 수 있음

1. 여러 형태로 렌더링을 해줄 수 있음 (html, json, xml 등등, 각 출력형태에 대한 함수만 정의 해놓으면됨)
2. 여러 장르를 만들고, 그에 대한 계산도 각각 다르게 해줄 수 있음 (PerformanceCalculator를 상속받고 amount와 volumeCredits을 재정의 해주면 됨)

---

### 정리

1. 리팩터링을 하는 이유는 **유지보수를 하기 때문임** (들어오는 요구사항에 편하게 대응하기 위함)
   - 들어오는 요구사항에 편하게 대응하기 위함은 다음 정보를 축약하고 있음
     - 내가 새롭게 구현한 기능을, 기존의 시스템에 편하게(잘 맞물리게) 넣을 수 있는가?
     - 내가 수정해야 되는 기능을, 기존의 시스템에 편하게(잘 맞물리게) 바꿀 수 있는가?
   - 그러면 반대로(vice versa)리팩터링을 하지 말아야 되는 이유도 알 수 있음
     - 내가 새롭게 구현한 기능을 현 시스템에 편하게 넣을 수 있어서
     - 내가 수정한 기능을 현 시스템에 편하게 넣을 수 있어서
     - 하지만 개발 경력이 매우매우 짧은 나로서는 (리팩토링을) **하지말아야 되는 이유**보다 **해야되는 이유가 엄청 너무 매우 많다.**

1-1. 좋은 코드를 가늠하는 확실한 방법은 얼마나 수정하기 쉬운가인데, 수정하기 쉬운 코드를 만들기 위해 리팩터링을 한다는 것

2. 대개 기능 구현을 하기 어려운 상황이라면 리팩터링으로 편한 구조로 바꾼 후 작업 시작

- 위의 예시 - statement()의 함수안에 로직이 몰려 있어서 구조를 바꿈
  - statement()의 로컬 변수를 다 뺐고 (전부 함수로 만들어 버리고)
  - 계산 단계와 출력 단계로 나눴음 (그래서 파일도 분리 함)
- 언제까지? 기능 구현에 있어 편해질 때까지
  - 위의 예시 - html 렌더링 기능 구현에 앞서 statement() 리팩터링을 함
  - 위의 예시2 - 장르 추가, 장르별 각각 다른 계산 기능 구현에 앞서 statement() 리팩터링을 함

3. **리팩터링 싸이클은 어떻게 이루어지는지**

1. 내가 작업할 코드를 살펴봄
1. 리팩터링할 영역에 대한 테스트 코드를 마련한다. (저는 단순 `node script.js` 커맨드로 값 나온 것 확인했습니다.)
   - `리팩터링 기법들이 버그 발생 여지를 최소화하도록 구성됐다곤 하지만 실제 작업은 사람이 수행하기에 언제든 실수 할 수 있다.`
1. 리팩터링 기법(함수 선언바꾸기, 변수 인라인하기, 문장 슬라이드, 반복문 쪼개기 등등)을 활용해 하나의 수정을 완료
   - ex - statement() 함수의 로컬변수 하나를 `변수 인라인` 기법을 활용해 제거하기
1. 테스팅
   - 피드백을 얻는 주기가 엄청 짧아 오류가 발생하더라도 금방 대처가 가능
1. 성공하면 그대로 리팩터링 진행하기
   - 리팩터링을 하는 단계가 엄청 잘게 나누어져 있음

ㄴ 코드 읽음 → 개선점 파악 → 리팩터링으로 개선점 적용 후 코드 반영 → 코드가 명확해지고 이해하기 쉬워짐 → 또 다른 개선점이 떠오르고 선순환이 형성됨

**마틴 파울러 아조씨의 말씀 수록**

- 프로그램이 새로운 기능을 추가하기에 편한 구조가 아니라면, 먼저 기능을 추가하기 쉬운 형태로 리팩터링하고 나서 원하는 기능을 추가한다.
- 리팩터링하기 전에 제대로 된 테스트부터 마련한다. 테스트는 반드시 자가진단하도록 만든다.
- 리팩터링은 프로그램 수정을 작은 단계로 나눠 진행한다. 그래서 중간에 실수하더라도 버그를 쉽게 찾을 수 있다.
- 캠핑자들에게는 "도착했을 때보다 깔끔하게 정돈하고 떠난다"는 규칙이 있다. 프로그래밍도 마찬가지다. 항시 코드베이스를 작업 시작 전보다 건강하게(healthy) 만들어놓고 떠나야 한다.
- 코드는 명확해야 한다. 코드를 수정해야 할 상황이 되면 고쳐야 할 곳을 쉽게 찾을 수 있고, 오류 없이 빠르게 수정할 수 있어야 한다. **건강한 코드베이스는 생산성을 극대화하고, 고객에게 필요한 기능을 더 빠르고 저렴한 비용으로 제공해준다. 코드를 건강하게 관리하려면 프로그래밍 팀의 현재와 이상의 차이에 항상 신경 쓰며, 이상에 가까워지도록 리팩터링하는 것이다.**
- 리팩터링을 효과적으로 하는 핵심은 단계를 잘게 나눠야 더 빠르게 처리할 수 있고, 코드는 절대 깨지지 않으며, 이런 단계들이 모여서 상당히 큰 변화를 이룰 수 있다는 사실을 깨닫는 것이다.
