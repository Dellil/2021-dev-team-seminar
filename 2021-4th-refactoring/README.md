이번에 다룰 것은...

## 3.4 긴 매개변수 목록

전역 데이터 사용을 방지하기 위해 함수에 필요한 것들을 매개 변수로 전달하곤 한다.

하지만 매개 변수가 늘어나 하나의 목록(list)가 되면 그것만으로도 코드를 이해하는데 어려움을 겪는다. 그래서 **긴 매개변수를 정리하려면?**

### 레시피

- **매개변수를 질의 함수로 바꾸기** (11.5절)
  - 다른 매개변수에서 값을 얻어올 수 있는 매개변수가 있는 경우, 상위의 스코프에서 값을 얻어 올 수 있는 경우 사용한다.

[절차]

1. 제거할 매개변수 값을 구할 수 있는 코드를 함수로 추출할 수 있으면 추출한다.
2. 제거할 매개변수를 찾아 그것들의 참조를 함수 호출로 바꾼다.

```jsx
// situation - Order 클래스의 finalPrice getter
get finalPrice() {
	const basePrice = this.quantity * this.itemPrice;
	let discountLevel;
	if (this.quantity > 100) discountLevel = 2;
	else discountLevel = 1;
	return this.discountedPrice(basePrice, discountLevel);
}

// Order 클래스의 discountedPrice
discountedPrice(basePrice, discountLevel) {
	switch(discountLevel) {
		case 1: return basePrice * 0.95;
		case 2: return basePrice * 0.9
	}
}

/* 리팩터링 시작 */
get finalPrice() {
	const basePrice = this.quantity * this.itemPrice;
	// discountLevel이 getter로 빠졌다.
	return this.discountedPrice(basePrice);
}

discountedPrice(basePrice) {
	switch(this.discountLevel) {
		case 1: return basePrice * 0.95;
		case 2: return basePrice * 0.9;
	}
}

// 질의 함수로 빼주기
get discountLevel() {
	return (this.quantity > 100) ? 2 : 1;
}
```

- **객체 통째로 넘기기 (11.4절)**
  - 객체의 프로퍼티를 넘기지않고, 객체를 매개변수로 넘기는 기법

[절차]

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

- **매개변수 객체로 만들기 (6.8절)**
  - 매개변수 여러 개가 이 함수 저 함수 몰려다닐때, 하나로 뭉쳐주는 기법

이 기법은 무엇이 좋을까?

- 객체구조로 받게해서 데이터들의 관계가 명확해짐
- **코드를 더 근본적으로 바꿔준다고 한다.**
  - 객체(새로운 데이터구조) 로 만들고, 이걸 활용하는 형태로 코드 재구성할 수 있다.
    - 객체에 담길 데이터에 공통으로 적용되는 동작을 추출해서 함수로 만들수도 있고..
    - 클래스로 만들수도 있고..
  - 이렇게 되면 도메인이 간결하게 정의 되면서 코드의 개념을 다시 그릴 수 있다한다.
    - _~~나도 이런거 느껴보고 싶다~~_
- 아무튼 이 모든 것의 시작은 매개변수들을 하나로 뭉쳐주는 것부터다.

[절차]

1. 적당한 데이터 구조가 없다면 새로 만든다.
2. 함수 호출 시 새 데이터 구조를 넘기도록 수정한다.

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

- **플래그 인수 제어하기 (11.3절)**

우선, 플래그 인수란? ⇒ 플래그 인수는 피호출 함수의 로직을 **호출하는 쪽**에서 선택하기 위해 전달하는 인수다.

플래그 인수의 간단한 예

```jsx
function bookConcert(aCustomer, isPremium) {
  if (isPremium) {
    // 프리미엄 예약용 로직
  } else {
    // 예약용 로직
  }
}

// 호출하는 쪽에서는...
bookConcert(aCustomer, true);
bookConcert(aCustomer, CustomerType.PREMIUM);
bookConcert(aCustomer, "premium");
bookConcert(aCustomer, aCustomer.isPremium);
```

이런 플래그 인수는 읽는 사람에게 뜻을 온전히 전달하지 못해 좋지 못함

차라리 이게 더 낫다.

```jsx
// 특정 기능 하나만 수행하게끔 분리
bookConcert(aCustomer);
premiumBookConcert(aCustomer);
```

[절차]

1. 매개변수로 주어지는 값에 대응하는 함수들을 만든다.
   - 조건문 분해하기로 분해할 수 있다면 그리 하고, 안되면 래핑 함수의 형태로 만든다.
2. 원래 함수를 호출하는 코드들에다가 1번에서 만든 함수들을 호출하도록 수정한다.

### 예시: 배송일자를 계산하는 호출 발견

```jsx
// 어떤 곳에서는 이렇게 호출하고
aShipment.deliveryDate = deliveryDate(anOrder, true);
// 또 어떤 곳에서는 이렇게 호출한다.
aShipment.deliveryDate = deliveryDate(anOrder, false);

function deliveryDate(anOrder, isRush) {
  if (isRush) {
    let deliveryTime;
    if (["MA", "CT"].includes(anOrder.deliveryState)) deliveryTime = 1;
    else if (["NY", "NH"].includes(anOrder.deliveryState)) deliveryTime = 2;
    else deliveryTime = 3;
    return anOrder.placedOn.plusDays(1 + deliveryTime);
  } else {
    let deliveryTime;
    if (["MA", "CT", "NY"].includes(anOrder.deliveryState)) deliveryTime = 2;
    else if (["ME", "NH"].includes(anOrder.deliveryState)) deliveryTime = 3;
    else deliveryTime = 4;
    return anOrder.placedOn.plusDays(2 + deliveryTime);
  }
}

// deliveryDate는 boolean 값을 이용해서 어느 쪽 코드를
// 실행할지 정하는 전형적인 플래그 인수다.
// 위의 예시는 조건문 분해하기를 적용할 수 있다. (그렇게 만들어진 아래 코드)

function rushDeliveryDate(anOrder) {
  let deliveryTime;
  if (["MA", "CT"].includes(anOrder.deliveryState)) deliveryTime = 1;
  else if (["NY", "NH"].includes(anOrder.deliveryState)) deliveryTime = 2;
  else deliveryTime = 3;
  return anOrder.placedOn.plusDays(1 + deliveryTime);
}

function regularDeliveryDate(anOrder) {
  let deliveryTime;
  if (["MA", "CT", "NY"].includes(anOrder.deliveryState)) deliveryTime = 2;
  else if (["ME", "NH"].includes(anOrder.deliveryState)) deliveryTime = 3;
  else deliveryTime = 4;
  return anOrder.placedOn.plusDays(2 + deliveryTime);
}

// 이렇게 만들게 되면 호출하는 쪽의 코드는 아래와 같이 바꿀 수 있다.
aShipment.deliveryDate = rushDeliveryDate(anOrder);
// 또 어떤 곳에서는 이렇게 호출한다.
aShipment.deliveryDate = regularDeliveryDate(anOrder);
```

### 예시2: 까다로운 방식으로 매개변수 사용

예시1은 함수 핵심 로직의 바깥쪽에 있을 때만 이용할 수 있다.

다음과 같은 까다로운 버전의 deliveryDate를 봐보자.

```jsx
function deliveryDate(anOrder, isRush) {
  let result;
  let deliveryTime;
  if (anOrder.deliveryState === "MA" || anOrder.deliveryState === "CT")
    deliveryTime = isRush ? 1 : 2;
  else if (anOrder.deliveryState === "NY" || anOrder.deliveryState === "NH") {
    deliveryTime = 2;
    if (anOrder.deliveryState === "NH" && !isRush) deliveryTime = 3;
  } else if (isRush) deliveryTime = 3;
  else if (anOrder.deliveryState === "ME") deliveryTime = 3;
  else deliveryTime = 4;

  result = anOrder.placedOn.plusDays(2 + deliveryTime);
  if (isRush) result = result.minusDays(1);
  return result;
}

// isRush를 제거하는데 일이 커질 것 같아, 래핑 함수를 사용
function rushDeliveryDate(anOrder) {
  return deliveryDate(anOrder, true);
}
function regularDeliveryDate(anOrder) {
  return deliveryDate(anOrder, false);
}
```

- **여러 함수를 클래스로 묶기 (6.9절)**
  - 공통 데이터를 중심으로 동작하는 함수 무리들이 있을 때 사용하는 방법

```jsx
function base(aReading) {...}
function taxableCharge(aReading) {...}
function calculateBaseCharge(aReading) {...}

class Reading {
	base() {...}
	taxableCharge() {...}
	calculateBaseCharge() {...}
}
```

함수들이 공유하는 공통 환경을 더 명확히 표현할 수 있음

클래스로 묶어 각 함수에 전달되는 인수를 줄임

따라서 (함수 무리들을 묶어 만든) 객체 안에서의 함수 호출을 간결하게 만들 수 있다.

## (정리) 긴 매개변수 목록

전역 데이터 사용을 방지하기 위해 함수에 필요한 것들을 매개 변수로 전달함

하지만 매개 변수가 늘어나 하나의 목록(list)가 되면 그것만으로도 코드를 이해하는데 어려움을 겪음 그래서 **긴 매개변수를 줄일려면?**

- **매개변수를 질의 함수로 바꾸기** (11.5절)
  - 다른 매개변수에서 값을 얻어올 수 있는 매개변수가 있는 경우,
    상위의 스코프에서 값을 얻어 올 수 있는 경우에 사용하는 방법
- **객체 통째로 넘기기 (11.4절)**
  - 객체의 프로퍼티를 넘기지않고, 객체를 매개변수로 넘기는 방법
- **매개변수 객체로 만들기 (6.8절)**
  - 매개변수 여러 개가 이 함수 저 함수 몰려다닐때, 하나로 뭉쳐주는 방법
- **플래그 인수 제어하기 (11.3절)**
  - 피호출 함수가 플래그 인수에 의해 코드가 실행될 때 사용하는 방법
- **여러 함수를 클래스로 묶기 (6.9절)**
  - 공통 데이터를 중심으로 동작하는 함수 무리들이 있을 때 사용하는 방법

---

## 3.6 가변 데이터

### 가변데이터의 문제점...

- 데이터를 변경했더니 예상치 못한 결과나 골치 아픈 ㅈ버그로 이어지는 경우가 종종 있음
  - 코드의 다른 곳은 다른 값을 기대한다는 사실을 인식하지 못하고 수정했기 때문
  - 결국 프로그램 오작동
- 데이터를 변경했더니 예상치 못한 결과나 골치 아픈 ㅈ버그로 이어지는 경우가 종종 있음
  - 코드의 다른 곳은 다른 값을 기대한다는 사실을 인식하지 못하고 수정했기 때문
  - 결국 프로그램 오작동

때문에 함수형 프로그래밍에선 **불변성**(데이터는 절대 변하지 않고, 데이터를 변경하려면 반드시 변경하려는 값의 복사본을 반환한다는 개념)을 근본으로 삼고 있음

### 레시피

- **변수 캡슐화하기 (6.6절)**
  - 요걸로 정해놓은 함수를 통해서만 값을 수정할 수 있도록 하면 값이 어떻게 수정되는지 감시하거나 코드를 개선하기 쉬움!

[절차]

1. 변수의 접근과 갱신을 담당하는 캡슐화 함수를 만든다.
2. 직접 변수를 참조하던 부분을 1의 함수들로 바꾼다.
3. 변수의 접근 범위를 제한한다.

### 예시1

```jsx
// 아주 중요한 데이터가 담긴 변수
let defaultOwner = { firstName: "찬희", lastName: "장" };
// 그 변수를 참조하고 갱신하는 코드
spaceship.owner = defaultOwner;
defaultOwner = { firstName: "규원", lastName: "이" };

// 기본적인 캡슐화
function getDefaultOwner() {
  return defaultOwner;
}
function setDefaultOwner(arg) {
  defaultOwner = arg;
}
spaceship.owner = getDefaultOwner();
setDefaultOwner({ firstName: "규원", lastName: "이" });

// 하지만 여전히 변수로 원본 데이터를 바꿔버릴 수 있다.
spaceship.owner.firstName = "찬희";

// 변수 접근 범위 제한을 하기 위해
// 다른 파일로 옮기고 getter, setter만 export 하기
```

### 예시2

예시 1과 2의 차이점

예시 1 - 데이터 항목을 참조하는 부분만 캡슐화

예시 2 - **변수뿐 아니라** **변수에 담긴 내용을 변경하는 행위까지 제어할 수 있게 캡슐화**

```jsx
// 데이터의 복제본을 반환하도록 수정함
let defaultOwner = { firstName: "찬희", lastName: "장" };
function getDefaultOwner() {
  return Object.assign({}, defaultOwner);
}
function setDefaultOwner(arg) {
  defaultOwner = arg;
}

// 복제본을 반환하도록 하는 두번째 방법에는 class로 감싸는 방법이 있음
class Person {
  constructor(date) {
    this.lastName = data.lastName;
    this.firstName = data.firstName;
  }
  get lastName() {
    return this.lastName;
  }
  get firstName() {
    return this.firstName;
  }
}

let defaultOwner = { firstName: "찬희", lastName: "장" };
function getDefaultOwner() {
  return new Person(defaultOwner);
}
function setDefaultOwner(arg) {
  defaultOwner = arg;
}
```

- **변수 쪼개기 (9.1절)**
  - 하나의 변수에 용도가 다른 값들을 저장하느라 값을 갱신하는 경우 이걸 이용하자
  - 용도별로 나눠 값 갱신하는데 문제가 안 생기게끔 하는 목적
    [절차]

1. 변수 선언부와 대입부에서 변수 이름을 변경
2. 가능하면 불변으로 선언하자!
3. 두번째 값 대입이 일어나는 경우 1번부터 반복한다.
4. 새 변수로 만들 코드가 없을 때까지 반복한다.

### 예시

해기스 (대충 순대 비슷한 음식)가 다른 지역으로 전파된 거리를 구하는 코드다.

해당 지역에서 초기 힘을 받아 일정 가속도로 전파되다가,

시간이 흐르고 두번째 힘을 받아 전파 속도가 빨라진다고 가정

```jsx
// BEFORE
function distanceTravelled(scenario, time) {
  let result;
  let acc = scenario.primaryForce / scenario.mass;
  let primaryTime = Math.min(time, scenario.delay);
  result = 0.5 * acc * primaryTime * primaryTime;
  let secondaryTime = time - scenario.delay;
  if (secondaryTime > 0) {
    let primaryVelocity = acc * scenario.delay;
    acc = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass;
    result +=
      primaryVelocity * secondTime + 0.5 * acc * secondaryTime * secondaryTime;
  }
  return result;
}

// AFTER
function distanceTravelled(scenario, time) {
  let result;
  let primaryAcceleration = scenario.primaryForce / scenario.mass;
  let primaryTime = Math.min(time, scenario.delay);
  result = 0.5 * primaryAcceleration * primaryTime * primaryTime;
  let secondaryTime = time - scenario.delay;
  if (secondaryTime > 0) {
    let primaryVelocity = primaryAcceleration * scenario.delay;
    const secondaryAcceleration =
      (scenario.primaryForce + scenario.secondaryForce) / scenario.mass;
    result +=
      primaryVelocity * secondTime +
      0.5 * acc * secondaryAcceleration * secondaryTime;
  }
  return result;
}
```

- **질의 함수와 변경 함수 분리하기 (11.1절)**
  - 파울러 센세가 API 만들 때 이걸 활용해서 side effect없는 코드를 짜라고 말씀하셨다,
  - 상태를 변경하는 부분과 질의하는 부분이 합쳐져 있으면 한번 써보자

[절차]

1. 함수 복붙 후, 질의(getter) 목적에 맞는 충실한 이름을 짓는다.
2. 1번의 함수에서 사이드 이펙트를 모두 제거한다.
3. 함수 호출부에서 코드를 수정한다.
4. 기존 함수에서 질의 관련 코드를 없앤다.

### 예시

```jsx
// 이름 목록을 훑어 악당을 찾는 함수, 악당을 찾으면 경고를 울려버린다.
function alertForMiscreant(people) {
  for (const p of people) {
    if (p === "조커") {
      setOffAlarms();
      return "조커";
    }
    if (p === "사루만") {
      setOffAlarms();
      return "사루만";
    }
  }
  return "";
}

// 1. 함수를 복붙하고 질의 목적에 맞는 이름을 짓고
// 2. 사이드 이펙트 관련 코드를 지우자!
function findMiscreant(people) {
  for (const p of people) {
    if (p === "조커") {
      return "조커";
    }
    if (p === "사루만") {
      return "사루만";
    }
  }
  return "";
}

// 3. 함수 호출부도 바꿔준다!
const found = alertForMiscreant(people);
const found = findMiscreant(people);
alertForMiscreant(people);

// 4. 기존 함수에서 질의 관련 코드를 없애준다!
function alertForMiscreant(people) {
  for (const p of people) {
    if (p === "조커") {
      setOffAlarms();
      return;
    }
    if (p === "사루만") {
      setOffAlarms();
    }
  }
  return;
}
```

- **세터 제거하기 (11.7절)**
  - 변수 유효범위 줄이기

### 예시

```jsx
// Person 클래스의 일부 코드...
get name() { return this.name; }
set name(arg) { this.name = arg; }
get id() { return this.id; }
set id(arg) { this.id = arg; }

const 장찬희 = new Person();
장찬희.name = "찬희";
장찬희.id = "aksaksdm";

// 하지만 객체를 생성한 뒤, id는 변경되면 안됩니다.
// 이 id 세터를 지워볼까요?
// Person 클래스의 일부 코드...
// 생성자로만 받을 수 있게 고침
constructor(id) {
	this.id = id;
}

get name() { return this.name; }
set name(arg) { this.name = arg; }
get id() { return this.id; }
~~set id(arg) { this.id = arg; }~~
```

## (정리) 가변 데이터

데이터를 변경했더니 예상치 못한 결과나 골치 아픈 ㅈ버그로 이어지는 경우가 종종 있음

가변 데이터라는 코드스멜을 해결하는 방법은?

- **변수 캡슐화하기 (6.6절)**
- **변수 쪼개기 (9.1절)**
- **질의 함수와 변경 함수 분리하기 (11.1절)**
- **세터 제거하기 (11.7절)**
