# 3.3 긴 함수 - Long Function

- 오랜 기간 잘 활용되는 프로그램들은 하나 같이 짧은 함수로 구성 됐다.
  - 이런 짧은 함수들로 구성된 것들은 코드를 보면 연산하는 부분이 없어 보임
    왜냐하면 위임하는 방식으로 작성됐기 때문임
  - 간접 호출의 효과 → 코드를 이해하고, 공유하고 선택하기 쉬워지는 이유는 함수를 짧게 구성했기 때문
    그리고 이름을 잘 지어두면 금상첨화
  - 주석을 달아야 된다 싶으면 '함수'로 만들자
    - 그 만들어진 함수는 주석으로 설명하려던 코드가 담김
      동작 방식이 아닌 '의도' (목적)을 드러내며 이름 짓기
  - 함수로 묶는 코드는 한 줄 일수도, 여러 줄 일 수도 있다.
    - 원래 코드보다 길어지더라도 함수로 뽑자
    - 핵심은 함수의 목적과 구현 코드의 괴리가 얼마나 큰 가임, **'무엇을 하는지'** 잘 설명해주지 못 할수록 함수로 만드는게 유리함

## 3.3 긴 함수에 대처하는 리팩터링 레시피

- **함수 추출하기** (6.1절)는 긴 함수에 대처하는 99%의 방법임
  이 기법으로 함수를 빼내자
- 하지만 매개변수와 임시변수가 많아 함수 추출하기를 하면 더 난잡해질 수 있다.
  이런 상황이 발생한다면 - **임시 변수를 질의 함수로 바꾸기** (7.4절) - **매개변수 객체 만들기** (6.8절) - **객체 통째로 넘기기** (11.4절) - 이래도 많다면? - **함수를 명령으로 바꾸기** (11.9절)
- 추가로...

  - 조건문이 있으면, **조건문 분해하기** (10.1절)

  ***

  _(지금은 못 다룬 것)_

  - 같은 조건으로 나뉘는 스위치문이 여러 개라면?, **조건문을 다형성으로 바꾸기** (10.4절)
  - 반복문 독립된 함수로 만들자, **반복문 쪼개기** (8.7절)

  ```tsx
  // 반복문 쪼개기
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // before
  let a = 0;
  let b = 0;
  for (number of array) {
    if (number % 2 === 0) a += number;
    else if (number % 2 !== 0) b += number;
  }

  // after
  array.filter((num) => num % 2 === 0).reduce((acc, cur) => acc + cur);

  array.filter((num) => num % 2 !== 0).reduce((acc, cur) => acc + cur);
  ```

---

### 6.1 함수 추출하기

이 기법은 이미 3.2에서 다뤘으니 건너뜀!

---

## 함수 추출전, 매개 변수와 임시 변수가 많을 때 쓰는 레시피

### 7.4 임시 변수를 질의 함수로 바꾸기

(Replace Temp with Query)

[임시 변수가 많아 함수 추출하기 귀찮을 때 쓰는 기법]

- 대충 getter로 만든다는 뜻

함수안에서 어떤 코드의 결괏값을 뒤에서 참조할 목적으로 임시 변수를 씀

```jsx
const basePrice = this._quantity * this._itemPrice;
if (basePrice > 1000) return basePrice * 0.95;
else return basePrice * 0.98;
```

임시 변수 사용으로 좋은 점

- 값을 계산하는 코드(`this._quantity * this._itemPrice;`)를 줄일수있음
- 변수명으로 값의 의미를 설명할 수 있음

하지만 함수로 만들어 사용하는 편이 더 나을 때가 많다.

긴 함수의 한 부분을 별도 함수로 추출할 때, 변수들을 각각의 함수로 만들면 쉬워진다!

ㄴ> 추출한 함수에 변수를 전달할 필요가 없기 때문

팁) 변수에 값을 한 번 대입한 뒤, 다른 코드에서 여러 차례 다시 대입하는 경우는 모두 질의 함수로 추출해야 한다.

**절차**

1. 변수가 사용되기 전 값이 확실히 결정되는지, 변수를 사용할 때마다 계산 로직이 매번 다른 결과를 내진 않는지 확인
2. 읽기 전용으로 만들 수 있는 건 읽기 전용으로 만든다. (`var, let`을 `const`로)
3. 테스트!
4. 변수 대입문을 함수로 추출
5. 테스트
6. 변수 제거

### 예제(임시 변수를 질의 함수로 바꾸기)

```jsx
// Order 클래스
class Order {
  constructor(quantity, item) {
    this._quantity = quantity;
    this._item = item;
  }

  get price() {
    var basePrice = this._quantity * this._item.price;
    var discountFactor = 0.98;

    if (basePrice > 1000) discountFactor -= 0.03;
    return basePrice * discountFactor;
  }
}
```

```jsx
// Order 클래스
// 1 - 읽기 전용으로 만든다.
class Order {
	constructor(quantity, item) {
		this._quantity = quantity;
		this._item = item;
	}

	get price() {
		// var에서 const로 변경해서 컴파일 에러가 나는지 확인
		const basePrice = this._quantity * this._item.price;
		var discountFactor = 0.98;
		if(basePrice > 1000) discountFactor -= 0.03;
		return basePrice * discountFactor;
	}
}

// 2 - getter로 추출(함수 추출)
get price() {
	const basePrice = this.basePrice;
	var discountFactor = 0.98;
	if(basePrice > 1000) discountFactor -= 0.03;
	return basePrice * discountFactor;
}
// getter는 여기에 있어요~~
get basePrice() {
	return this._quantity * this._item.price;
}

// 3 - 변수 인라인
get price() {
	var discountFactor = 0.98;
	if (this.basePrice > 1000) discountFactor -= 0.03;
	return this.basePrice * discountFactor;
}

// 위의 discountFactor도 함수 추출 -> 변수 인라인 과정을 거쳐보자
get price() {
	const discountFactor = this.discountFactor;
	return this.basePrice * discountFactor;
}
// 1 - 함수 추출
get discountFactor() {
	var discountFactor = 0.98;
	if (this.basePrice > 1000) discountFactor -= 0.03;
	return discountFactor;
}

// 2 - 변수 인라인
get price() {
	return this.basePrice * this.discountFactor;
}

```

---

### 6.8 매개변수 객체 만들기

(Introduce Parameter Object)

[매개변수 여러 개가 이 함수 저 함수 몰려다닐때, 하나로 뭉쳐주는 기법]

이렇게 하면 어떤게 좋을까?

- 객체구조로 받게해서 데이터들의 관계가 명확해짐
- **코드를 더 근본적으로 바꿔준다고 한다.**
  - 객체(새로운 데이터구조) 로 만들고, 이걸 활용하는 형태로 코드 재구성할 수 있다.
    - 객체에 담길 데이터에 공통으로 적용되는 동작을 추출해서 함수로 만들수도 있고..
      - 클래스로 만들수도 있고..
  - 이렇게 되면 도메인이 간결하게 정의 되면서 코드의 개념을 다시 그릴 수 있다한다.
    - _~~나도 이런거 느껴보고 싶다~~_
- 아무튼 이 모든 것의 시작은 매개변수들을 하나로 뭉쳐주는 것부터다.

**절차**

1. 적당한 데이터 구조가 없다면 새로 만든다.
2. 테스트한다.
3. 함수 호출 시 새 데이터 구조를 넘기도록 수정한다.
4. 테스트한다.

### 예시

온도 측정 값 배열에서 정상 작동 범위를 벗어난 것이 있는지 검사하는 코드

```jsx
// 데이터셋
const station = {
	name: "ZB1",
	readings: [
		{ temp: 47, time: "2016-11-10 09:10" },
		{ temp: 53, time: "2016-11-10 09:20" },
		{ temp: 58, time: "2016-11-10 09:30" },
		{ temp: 53, time: "2016-11-10 09:40" },
		{ temp: 51, time: "2016-11-10 09:50" },
	]
}

// 정상 범위 벗어난 측정값 찾는 함수
function readingOutsideRange(station, min, max) {
	return station.readings.filter(r => r.temp < min || r.temp > max);
}

// 호출문
alerts = readingsOutsideRange(station,
															operatingPlan.temperatureFloor,
															operatingPlan.temperatureCeiling);

// 1. 적당한 데이터 구조 만들기
class NumberRange {
	constructor(min, max) {
		this._data = { min: min, max: max};
	}
	get min() { return this._data.min; }
	get max() { return this._data.max; }

// 2. 함수 호출 시 새 데이터 구조를 넘기도록 수정
function readingOutsideRange(station, ranage) {
	return station.readings.filter(r => r.temp < range.min || r.temp > range.max);
}

const range = new NumberRange(operation.temperatureFloor,
															operation.temperatureFloorCeiling);

alerts = readingsOutsideRange(station, range);
```

---

### 11.4 객체 통째로 넘기기

(Preserve Whole Object)

[객체의 프로퍼티를 넘기지않고, 객체를 매개변수로 넘기는 기법]

6.8 매개변수 객체 만들기와 다른점은..

- 6.8은 아무렇게나 널부러져있는 매개변수들을 묶어서 특정한 의미를 부여해주는 하나의 덩어리로 만들어줬다면
- 이번 리팩터링 기법은 객체의 프로퍼티를 매개변수로 넘기던 것에서 객체를 넘기라는 것

**절차**

1. 매개변수를 원하는 형태로 받는 빈(empty) 함수를 만든다.
2. 새 함수의 본문은 기존 함수를 호출하고, 새 매개변수와 기존 매개변수를 매핑한다.
3. 기존 함수를 호출하는 곳에서 새 함수를 호출하도록 변경
4. 원래 함수를 인라인처리한다.
5. 새 함수의 이름을 바꾸고 이를 호출하는 곳도 반영해주기

```tsx
// 호출자
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if (!aPlan.withinRange(low, high))
	alerts.push("방 온도가 지정 범위를 벗어났습니다.");

// HeatingPlan 클래스...
withinRange(bottom, top) {
	return (bottom >= this._temperatureRange.low)
					&& (top <= this._temperatureRange.high);
}

----

// Range객체의 프로퍼티를 건네지말고 Range객체를 건네게끔 만들기
// 1. 빈 함수를 만들고,
// 2. 기존 함수를 호출하고, 새 매개변수(aNumberRange)와 기존 매개변수(low, high) 매핑
xxNEWwithinRange(aNumberRange) {
	return this.withinRange(aNumberRange.low, aNumberRange.high);
}

// 3. 기존 함수 호출하는 곳에서 새 함수 호출하도록 변경
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if (!aPlan.xxNEWwithinRange(aRoom.daysTempRange))
	alerts.push("방 온도가 지정 범위를 벗어났습니다.");

// 4. 원래 함수 인라인하기
xxNEWwithinRange(aNumberRange) {
	return (aNumberRange.low >= this._temperatureRange.low)
				&& (aNumberRange.high <= this._temperatureRange.high);
}

// 5. 새 함수 이름 바꾸고 새 함수를 호출하는 곳도 반영
withinRange(aNumberRange) {
	return (aNumberRange.low >= this._temperatureRange.low)
				&& (aNumberRange.high <= this._temperatureRange.high);
}
// 호출자
if (!aPlan.withinRange(aRoom.daysTempRange))
	alerts.push("방 온도가 지정 범위를 벗어났습니다.");
```

---

### 11.9 함수를 명령으로 바꾸기

(Replace Function With Command)

[하나의 함수를 객체안으로 캡슐화시키는 기법]

그 함수만을 위한 객체를 만들면 (캡슐화의 측면에서) 좋은점이 많음

- undo같은 보조연산 제공
- 유저친화적으로 커스텀마이징 가능

결론 - 클래스로 만들어버리면 더 자세한 핸들링이 가능함

**절차**

1. 기능을 옮길 클래스를 만든다. (이름은 기존 함수에 맞춰 만들자)
2. 빈 클래스로 함수 옮기기 (리팩터링이 끝나기 전까진 함수 선언부는 냅두자.)
3. 함수의 인수들을 클래스의 필드로 빼버리고 생성자를 통해 설정할지 고민

```tsx
// 옮길 것
function score(candidate, medicalExam, scoringGuide) {
  let result = 0;
  let healthLevel = 0;
  // 긴 코드 생략
}

class Score {
  constructor(candidate, medicalExam, scoringGuide) {
    this._candidate = candidate;
    this._medicalExam = medicalExam;
    this._scoringGuide = scoringGuide;
  }

  execute() {
    this._result = 0;
    this._healthLevel = 0;
    // 긴 코드 생략
  }
}
```

---

### 10.1 조건문 분해하기

복잡한 조건부 로직은 프로그램을 복잡하게 만드는 가장 흔한 원흉임

다양한 조건, 그에 따라 다양한 동작을 담은 코드를 작성하면 함수가 부풀어오름

조건을 검사하고 그 결과에 따른 동작을 표현한 코드는 무슨 일이 일어나는지는 얘기해주지만 '왜' 그게 일어 났는지 얘기를 안 해줌

**절차**

1. 조건식과 그 조건식에 딸린 조건절 각각을 함수로 추출한다.

### 예시

여름철이면 할인율이 달라지는 어떤 서비스의 요금 계산

```tsx
if(!aDate.isBefore(plan.summerStart) && !.aDate.isAfter(plan.summerEnd))
	charge = quantity * plan.summerRate;
else
	charge = quantity * plan.regularRate + plan.regularServiceCharge;

// 조건식을 별도 함수로 추출
if summer()
	charge = quantity * plan.summerRate;
else
	charge = quantity * plan.regularRate + plan.regularServiceCharge;

function summer() {
	return !aDate.isBefore(plan.summerStart) && !.aDate.isAfter(plan.summerEnd);
}

// 조건절도 함수로 추출
if summer()
	charge = summerCharge();
else
	charge = regularCharge();

function summer() {
	return !aDate.isBefore(plan.summerStart) && !.aDate.isAfter(plan.summerEnd);
}
function summerCharge() {
	return quantity * plan.summerRate;
}
function regularCharge() {
	return quantity * plan.regularRate + plan.regularServiceCharge;
}

// 취향에 따라 삼항연산자로 갈무리
charge = summer() ? summerCharge() : regularCharge();
```

---

### 느낀 점

이번 리팩터링 기법들을 보고, 리팩터링은 호출부만 보고 무엇을 하는지 알 수 있게끔 맥락을 부여하는 성질도 갖고 있다라는 생각이 듦

- 즉 (AOP, OOP의 개념을 뛰어넘어) 프로그래밍(프로그램을 작성하는 것)의 본질적인 것을 다룬다.

그러면 프로그램(소프트웨어 전체 시스템)의 **어느 부분**에서 이해하기 쉽게끔 맥락을 부여하면 좋을까?

- 어느 부분은 **Entry Gate**를 기준으로 하면 되지 않을까? (적어도 기능 구현이나 유지보수를 할 때, 맨 처음에 들어가서 보는 파일)
- 프론트엔드에서의 Entry Gate는 (일반적인 리액트 프로젝트 기준으로) 대개 라우터에 정의 되어 있는 컴포넌트일 것이다.
  - 실 예시) 현재 모바일 웹은 리액트로 이루어진 프로젝트이며, 라우터는 src/App 파일에 정의 되어 있음
  - /myfiles 로 라우팅될 때, 보여주는 컴포넌트로 MyFiles 컴포넌트가 있는데 이 MyFiles 컴포넌트가 Entry Gate라는 것
- 그러면 이해하기 쉽게끔 맥락을 부여한다는 것은 어떤 의미일까?
  아래와 같은 형태로 하고 있는 MyFiles에서

![MyFilesPseudoCode](https://user-images.githubusercontent.com/42995061/114527224-aef67100-9c82-11eb-977a-940416962b87.png)

아래와 같은 myFiles처럼
Entry Gate에서 어떤 것들이 있는지 알 수 있으면 된다!

![MyFilesPseudoCode2](https://user-images.githubusercontent.com/42995061/114527395-e8c77780-9c82-11eb-8394-2c1c031ee1cf.png)

![대충이미지라는뜻](https://user-images.githubusercontent.com/42995061/114527478-fd0b7480-9c82-11eb-8b24-5db328177383.png)

이렇게 좋은 점이 도영님께 이슈를 보고 받았을 때, 어디를 보면 되는지 바로 생각남

(리팩터링에 관련된 제 생각과 실 적용 사례와 관련된 건 다음 주에 더 자세히 풀 수 있도록 하겠습니다!)
