이번 주에 다룰 코드 스멜은 (3.7)뒤엉킨 변경 && (3.8)산탄총 수술

# 3.7 뒤엉킨 변경(Divergent Change)

### 배경

우리들은 코딩을 할 때 당연히 소프트웨어의 구조를 변경하기 쉬운 형태로 짜려고 노력한다.
그렇기때문에 우리가 코드를 수정할 때 시스템에서 고쳐야 할 "한 부분"만 콕 찝어서 수정을 하고자 함*(하지만 현실은?)*

하지만 고쳐야되는 부분이 한 부분이 아니라면 (서로 밀접한 악취인) **뒤엉킨 변경** 혹은 **산탄총 수술**과 같은 코드 스멜이 풍김

**뒤엉킨 변경**은 SRP(단일 책임 원칙)를 지키지 않았을 때 발생한다.

_SRP ⇒ 동일한 이유에 대해 변경되는 부분은 같이 있어야 되고, 다른 이유로 변경되는 건 떨어져 있어야 되는 법칙_

_SRP를 지키지 않았을 때 발생하는 일 ⇒ 하나의 모듈이 서로 다른 이유들로 인해 여러가지 방식으로 변경 됨_

ex ⇒ 지원해야 될 데이터베이스가 추가될 때마다 함수 세 개를 바꾸고, 금융 상품이 추가될 때 마다 또 다른 함수 네 개를 바꿔야하는 모듈이 있을때

위 예시의 DB연동과 금융 상품 처리는 서로 다른 맥락에서 이뤄지므로 독립된 모듈로 분리해야 프로그래밍이 편함

그래야 무언가를 수정할 때 해당 맥락의 코드만 이해해도 진행할 수 있음

### 레시피

- (DB에서 데이터를 가져와 금융 상품 로직에서 처리하기처럼) 순차적 실행이 자연스러운 맥락이라면

⇒ **다음 맥락에 필요한 데이터**를 **특정 데이터 구조**에 담아 전달하는 식으로 단계를 분리한다.

이때 쓰는 리팩터링 기법은 6.11 단계 쪼개기

### 6.11 단계 쪼개기

### 배경

서로 다른 두 대상을 한꺼번에 다루는 코드를 발견하면 각각을 별개 모듈로 나누는 방법을 찾는다.

코드를 수정해야 할 때 두 대상을 동시에 생각할 필요없이 하나에만 집중하기 위해서이다.

모듈이 잘 분리되어 있으면 다른 모듈의 구현은 몰라도 원하는 대로 마칠 수 있다.

그리고 단계를 쪼개는 기법은 주로 규모가 있는 소프트웨어에 사용된다. 하지만 저자는 규모에 관계없이 단계를 분리할 수 있는 상황이 생길 때마다 이 기법을 적용한다.

[절차]

1. 두번째 단계에 해당하는 코드를 독립 함수로 추출한다.
2. 중간 데이터 구조를 만들어서 1번의 함수의 인수로 추가한다.
3. 두번째 단계 함수의 매개변수를 검토한다. 첫번째 단계에서 사용되는 매개변수는 중간 데이터 구조로 옮긴다.
4. 첫번째 단계 코드를 함수로 추출하면서 중간 데이터 구조를 반환하도록 만든다.

**예시**

상품의 결제금액을 계산하는 코드

```jsx
// 결제 금액을 계산하는 priceOrder 함수,
// 두 단계로 나뉘어져 있다.
function priceOrder(product, quantity, shippingMethod) {
  // 상품의 가격을 구하는 단계
  const basePrice = product.basePrice * quantity;
  const discount =
    Math.max(quantity - product.discountThreshold, 0) *
    product.basePrice *
    product.discountRate;
  // 배송정보를 이용해 배송비를 계산하는 단계
  const shippingPerCase =
    basePrice > shippingMethod.discountThreshold
      ? shippingMethod.discountedFee
      : shippingMethod.feePerCase;
  const shippingCost = quantity * shippingPerCase;
  // 가격 = 기본가 - 할인금액 + 배송비
  const price = basePrice - discount + shippingCost;
  return price;
}

// 상품 가격과 배송비 계산을 더 복잡하게 만드는 변경이 생겼을 때 대처하기 위해
// 두 단계로 나누기로 함
// 우선 배송비 계산 부분을 applyShipping 함수로 추출
function priceOrder(product, quantity, shippingMethod) {
  const basePrice = product.basePrice * quantity;
  const discount =
    Math.max(quantity - product.discountThreshold, 0) *
    product.basePrice *
    product.discountRate;
  const price = applyShipping(basePrice, shippingMethod, quantity, discount);
  return price;
}

function applyShipping(basePrice, shippingMethod, quantity, discount) {
  const shippingPerCase =
    basePrice > shippingMethod.discountThreshold
      ? shippingMethod.discountedFee
      : shippingMethod.feePerCase;
  const shippingCost = quantity * shippingPerCase;
  const price = basePrice - discount + shippingCost;
  return price;
}
```

그 다음으로 첫 번째 단계와 두 번째 단계가 주고받을 중간 데이터 구조를 만든다.

```jsx
function priceOrder(product, quantity, shippingMethod) {
  const basePrice = product.basePrice * quantity;
  const discount =
    Math.max(quantity - product.discountThreshold, 0) *
    product.basePrice *
    product.discountRate;
  // 중간 데이터 구조인 priceData
  const priceData = {};
  const price = applyShipping(
    priceData,
    basePrice,
    shippingMethod,
    quantity,
    discount
  );
  return price;
}

function applyShipping(
  priceData,
  basePrice,
  shippingMethod,
  quantity,
  discount
) {
  const shippingPerCase =
    basePrice > shippingMethod.discountThreshold
      ? shippingMethod.discountedFee
      : shippingMethod.feePerCase;
  const shippingCost = quantity * shippingPerCase;
  const price = basePrice - discount + shippingCost;
  return price;
}
```

두번째 단계 함수의 매개변수를 검토한다. 첫번째 단계에서 사용되는 매개변수는 중간 데이터 구조로 옮긴다.

```jsx
function priceOrder(product, quantity, shippingMethod) {
  const basePrice = product.basePrice * quantity;
  const discount =
    Math.max(quantity - product.discountThreshold, 0) *
    product.basePrice *
    product.discountRate;
  // basePrice, quantity, discount를 중간 데이터 구조로 옮긴다.
  const priceData = { basePrice, quantity, discount };
  const price = applyShipping(priceData, shippingMethod);
  return price;
}

function applyShipping(priceData, shippingMethod) {
  const shippingPerCase =
    priceData.basePrice > shippingMethod.discountThreshold
      ? shippingMethod.discountedFee
      : shippingMethod.feePerCase;
  const shippingCost = priceData.quantity * shippingPerCase;
  const price = priceData.basePrice - priceData.discount + shippingCost;
  return price;
}
```

중간 데이터 구조를 다 만들었으니 첫번째 단계를 함수로 추출해서 이 데이터 구조를 반환하게끔 만든다.

```jsx
function priceOrder(product, quantity, shippingMethod) {
  const priceData = calculatePricingData(product, quantity);
  // 겸사겸사 price 변수도 쓸데없으니 인라인화 시킨다.
  return applyShipping(priceData, shippingMethod);
}

// 추출된 첫번째 단계 코드
function calculatePricingData(product, quantity) {
  const basePrice = product.basePrice * quantity;
  const discount =
    Math.max(quantity - product.discountThreshold, 0) *
    product.basePrice *
    product.discountRate;
  return { basePrice, discount, quantity };
}

function applyShipping(priceData, shippingMethod) {
  const shippingPerCase =
    priceData.basePrice > shippingMethod.discountThreshold
      ? shippingMethod.discountedFee
      : shippingMethod.feePerCase;
  const shippingCost = priceData.quantity * shippingPerCase;
  const price = priceData.basePrice - priceData.discount + shippingCost;
  return price;
}
```

그리고

- 전체 프로세스 곳곳에서 각각 다른 맥락의 함수를 호출한다면, 각 맥락에 대항되는 적당한 모듈들을 만들어서 관련 함수들을 모으자.

이때 쓰는 리팩터링 기법은 8.1 함수 옮기기이다.

그러면 처리과정이 맥락별로 구분이 된다!

### 8.1 함수 옮기기

[절차]

1. 옮길 함수가 있는 현재 컨텍스트에서, 다른 것들도 옮겨야 할 게 있는지 고민해본다.
   1. 함께 옮길 게 있다면 그걸 먼저 옮기는게 낫다. 또한 얽혀있는 함수가 여러 개라면 다른 곳에 미치는 영향이 적은 함수부터 옮긴다.
2. 함수를 복붙해서 옮길 곳에다가 붙여넣고 에러가 나지 않도록 잘 다듬는다.
3. 기존 함수가 있는 컨텍스트에서 옮긴 함수를 참조할 방법을 찾아 이를 반영한다.
4. 기존 함수를 제거할지 고-민

**예시 - 중첩 함수를 최상위로 옮기기**

GPS 추적 기록의 총 거리를 계산하는 함수

```jsx
function trackSummary(points) {
  const totalTime = calculateTime();
  const totalDistance = calculateDistance();
  const pace = totalTime / 60 / totalDistance;
  return {
    time: totalTime,
    distance: totalDistance,
    pace,
  };

  function calculateDistance() {
    let result = 0;
    for (let i = 1; i < points.length; i++) {
      result += distance(points[i - 1], points[i]);
    }
    return result;
  }

  function distance(p1, p2) {}
  function radians(degrees) {}
  function calculateTime() {}
}
```

`calculateDistance()`를 최상위로 옮겨 **추적 거리를 다른 정보와는 독립적으로 계산할 예정**

그래서 일단 이 함수를 최상위로 복사 할거임

```jsx
function trackSummary(points) {
  const totalTime = calculateTime();
  const totalDistance = calculateDistance();
  const pace = totalTime / 60 / totalDistance;
  return {
    time: totalTime,
    distance: totalDistance,
    pace,
  };

  function calculateDistance() {
    let result = 0;
    for (let i = 1; i < points.length; i++) {
      result += distance(points[i - 1], points[i]);
    }
    return result;
  }

  function distance(p1, p2) {}
  function radians(degrees) {}
  function calculateTime() {}
}

// 최상위로 calculateDistance() 함수 복사한다.
function top_calculateDistance() {
  let result = 0;
  for (let i = 1; i < points.length; i++) {
    result += distance(points[i - 1], points[i]);
  }
  return result;
}
```

그리고 distance와 points가 최상위의 `top_calculateDistance` 함수에는 없어서 추가해준다.

points는 매개변수로 주고, distance는 `calculateDistance` 함수안에 중첩함수의 형태로 넣어준다.

그 다음 잘 작동하면 코드를 복붙해 `top_calculateDistance` 함수의 코드를 새로 갱신한다.

```jsx
// 새로 갱신된 top_calculateDistance 함수
function top_calculateDistance(points) {
  let result = 0;
  for (let i = 1; i < points.length; i++) {
    result += distance(points[i - 1], points[i]);
  }
  return result;
}
```

distance()와 distance가 의존하는 코드도 옮긴다. 물론 calculateDistance의 안으로!

```jsx
// distance()와 distance가 의존하는 코드의 형태...
function distance(p1, p2) {
  const EARTH_RADIUS = 3959;
  const dLat = radians(p2.lat) - radians(p1.lat);
  const dLon = radians(p2.lon) - radians(p1.lon);
  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.cos(radians(p2.lat)) *
      Math.cos(radians(p1.lat)) *
      Math.pow(Math.sin(dLon / 2), 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

function radians(degrees) {
  return (degrees * Math.PI) / 180;
}

// calculateDistance의 안으로 distance와 그의 의존 코드를 옮긴다.
function trackSummary(points) {
  const totalTime = calculateTime();
  const totalDistance = calculateDistance();
  const pace = totalTime / 60 / totalDistance;
  return {
    time: totalTime,
    distance: totalDistance,
    pace,
  };

  function calculateDistance() {
    let result = 0;
    for (let i = 1; i < points.length; i++) {
      result += distance(points[i - 1], points[i]);
    }
    return result;

    // 여기 있어요!
    function distance(p1, p2) {}
    function radians(degrees) {}
  }

  function calculateTime() {}
}

function top_calculateDistance(points) {
  let result = 0;
  for (let i = 1; i < points.length; i++) {
    result += distance(points[i - 1], points[i]);
  }
  return result;

  // 여기 있어요!
  function distance(p1, p2) {}
  function radians(degrees) {}
}
```

calculateDistance()의 본문을 수정해, top_calculateDistance()를 호출한다.

```jsx
function trackSummary(points) {
  const totalTime = calculateTime();
  const totalDistance = calculateDistance();
  const pace = totalTime / 60 / totalDistance;
  return {
    time: totalTime,
    distance: totalDistance,
    pace,
  };

  function calculateDistance() {
    return top_calculateDistance(points);
  }

  function calculateTime() {}
}
```

기존 함수를 제거할지말지 고민을 한다. 여기서는 제거를 한다.

```jsx
function trackSummary(points) {
  const totalTime = calculateTime();
  const totalDistance = top_calculateDistance(points);
  const pace = totalTime / 60 / totalDistance;
  return {
    time: totalTime,
    distance: totalDistance,
    pace,
  };
}
```

딱히 totalDistance라는 변수를 남겨둘 이유가 없으니 변수 인라인을 시켜버리고, 이름도 멋있는 이름으로 바꿔준다.

```jsx
function trackSummary(points) {
  const totalTime = calculateTime();
  const pace = totalTime / 60 / totalDistance(points);
  return {
    time: totalTime,
    distance: totalDistance(points),
    pace,
  };
}

function totalDistance(points) {
  let result = 0;
  for (let i = 1; i < points.length; i++) {
    result += distance(points[i - 1], points[i]);
  }
  return result;
}
```

- 이때 여러 맥락의 일에 관여하는 함수가 있다면 관련 함수들을 모으기 전에 **6.1 함수 추출하기**부터 시행하자

⇒ 클래스라면 **7.5 클래스 추출하기**를 시도한다.

위 두개는 이미 봤던 것이고 간단한 것이라 스-킵

---

## 정리

뒤엉킨 변경이라는 코드스멜은 시스템의 한 모듈에 각각 다른 맥락들의 코드가 섞여있을 때 발생한다.

맥락을 분리할 때 순차적 실행의 형식으로 맥락이 분리된다면 **6.11 단계 쪼개기**를 이용해 단계를 분리한다.

ex) 다음 맥락에 필요한 데이터를 특정 데이터 구조에 담아 전달하는 식으로 단계를 분리

전체 프로세스에서 각각 다른 맥락의 함수를 호출하면 **8.1 함수 옮기기**를 이용하자. 그래서 각 맥락에 맞는 적당한 모듈들을 만들어서 관련 함수들을 모은다.

여러 맥락의 일에 관여하는 함수가 있으면 관련 함수를 모으기 전에 **함수를 추출하자(클래스라면 클래스 추출)**

---

# 3.8 산탄총 수술(Shotgun Surgery)

뒤엉킨 변경과 비슷하지만 정반대다.

산탄총 수술은 변경할 부분이 시스템의 여러 부분에 퍼져 있을 때 발생하는 코드 스멜이다.

### 레시피

함께 변경되는 애들을 **8.1 함수 옮기기**와 **8.2 필드 옮기기**로 모두 한 모듈에 묶어 버린다!

### 8.2 필드 옮기기

[절차]

1. 옮길 필드가 캡슐화되어 있지 않다면 캡슐화한다.
2. 옮겨질 객체에 필드를 생성한다.
3. 기존 객체에서 옮겨질 객체를 참조할 수 있는지 확인한다.
4. 기존 객체에서 옮겨질 객체의 필드를 사용하도록 수정한다.
5. 기존 필드를 제거한다.

**예시**

고객 클래스(Customer)와 계약 클래스(CustomerContract)에서 시작한다.

```jsx
class Customer {
  constructor(name, discountRate) {
    this._name = name;
    this._discountRate = discountRate;
    this._contract = new CustomerContract(dateToday());
  }

  get discountRate() {
    return this._discountRate;
  }
  becomePreferred() {
    this._discountRate += 0.03;
    // 다른 일들
  }
  applyDiscount(amount) {
    return amount.subtract(amount.multiply(this._discountRate));
  }
}

class CustomerContract {
  constructor(startDate) {
    this._startDate = startDate;
  }
}
```

위 코드에서 할인율을 뜻하는 discountRate를 Customer에서 CustomerContract로 옮길 것이다.

가장 먼저 할 것은 discountRate를 캡슐화하는 것이다!

```jsx
class Customer {
  constructor(name, discountRate) {
    this._name = name;
    this._setDiscountRate(discountRate);
    this._contract = new CustomerContract(dateToday());
  }

  get discountRate() {
    return this._discountRate;
  }
  _setDiscountRate(aNumber) {
    this._discountRate = aNumber;
  }
  becomePreferred() {
    this._setDiscountRate(this.discountRate + 0.03);
    // 다른 일들
  }
  applyDiscount(amount) {
    return amount.subtract(amount.multiply(this._discountRate));
  }
}
```

이제 CustomerContract 클래스에 필드와 접근자를 추가한다.

```jsx
class CustomerContract {
  constructor(startDate, discountRate) {
    this._startDate = startDate;
    this._discountRate = discountRate;
  }

  get discountRate() {
    return this._discountRate;
  }
  set discountRate(arg) {
    this._discountRate = arg;
  }
}
```

Customer의 접근자들이 새로운 필드를 사용하도록 수정하자.

```jsx
class Customer {
  constructor(name, discountRate) {
    this._name = name;
    this._contract = new CustomerContract(dateToday(), discountRate);
  }

  get discountRate() {
    return this._contract._discountRate;
  }
  _setDiscountRate(aNumber) {
    this._contract._discountRate = aNumber;
  }
  becomePreferred() {
    this._setDiscountRate(this.discountRate + 0.03);
    // 다른 일들
  }
  applyDiscount(amount) {
    return amount.subtract(amount.multiply(this._discountRate));
  }
}
```

비슷한 데이터를 다루는 함수가 많으면 **6.9 여러 함수를 클래스로 묶기**를 적용한다.

데이터 구조를 변환하거나 보강(객체에 프로퍼티를 추가하거나 빼버릴 때)하는 함수들은 **6.10 여러 함수를 변환 함수로 묶기**를 적용한다.

### 6.10 여러 함수를 변환 함수로 묶기

[절차]

1. 변환할 레코드를 입력받아 값을 반환하는 변환함수를 만든다.
2. 묶을 함수중 함수 하나를 골라 본문 코드를 변환 함수로 옮기고, 처리 결과를 레코드에 새 필드로 기록한다.

**예시**

서민에게 차를 수돗물처럼 제공하는 서비스있다고 가정, 매달 사용자가 마신 차의 양을 측정하고 코드 곳곳에서 다양한 방식으로 차 소비량을 계산한다.

```jsx
// 가상의 데이터
reading = {customer: 'ivan', quantity: 10, month: 5, year: 2017};

// client 1, 기본요금을 계산하는 코드
const aReading = acquireReading();
const baseCharge = baseRate(aReading.month, aReading.year) * aReading.quantity;

// client 2, 모든 시민이 차 세금을 일부 면제받아 기본 요금보다 적음
const aReading = acquireReading();
const base = (baseRate(aReading.month, aReading.year) * aReading.quantity);
const taxableCharge = Math.max(0, base - taxThreshold(aReading.year));

// client 3, 이렇게 계산하는 코드가 많아진 나머지 중복 코드가 나와버림
const aReading = acquireReading();
const basicChargeAmount = calculateBaseCharge(aReading);
// calculateBaseCharge는 다른 곳에서 이미 만들어진 함수라 가정한다.
function calculateBaseCharge(aReading) {
	return baseRate(aReading.month, aReading.year) * aReading.quantity;
```

다양한 파생 정보 계산 로직을 모두 하나의 변환 단계로 모은다.

변환 단계에서 미가공된 값을 받아 다양한 가공 정보를 덧붙여 반환한다.

```jsx
// 우선 입력 객체를 그대로 복사해 반환하는 변환 함수
function enrichReading(original) {
  const result = _.cloneDeep(original);
  return result;
}
```

이제 변경하려는 계산 로직 중 하나를 고른다. 먼저 이 로직에 값을 주기 전에 부가 정보를 덧붙이도록 수정한다.

```jsx
// calculateBaseCharge를 enrichReading 근처로 옮긴다.
function enrichReading(original) {
  result.baseCharge = calculateBaseCharge(result);
  return result;
}
```

부가 정보를 담은 필드를 사용하도록 수정한다.

```jsx
// client 1
const rawReading = acquireReading();
const aReading = enrichReading(rawReading);
const baseCharge = baseRate(aReading.month, aReading.year) * aReading.quantity;
const baseCharge = aReading.baseCharge;

// client 3
const rawReading = acquireReading();
const basicChargeAmount = calculateBaseCharge(aReading);
const aReading = enrichReading(rawReading);
const basicChargeAmount = aReading.baseCharge;
```

```jsx
// client 2
const rawReading = acquireReading();
const aReading = enrichReading(rawReading);
const taxableCharge = aReading.taxableCharge;

function enrichReading(original) {
  result.baseCharge = calculateBaseCharge(result);
  result.taxableCharge = Math.max(
    0,
    result.baseCharge - taxThreshold(result.year)
  );
  return result;
}
```

이렇게 묶어진 함수들의 출력 결과를 다음 단계의 로직으로 전달할 수 있다면 **6.11 단계 쪼개기**를 적용한다.

어설프게 분리된 로직은 **6.2 함수 인라인**이나 **7.6 클래스 인라인**같은 인라인 리팩터링으로 하나로 합친다.

함수나 클래스가 비대해지겠지만 나중에 추출하기 리팩터링으로 더 좋은 형태로 분리할 수 있다.

**_사실 우리는 작은 함수와 클래스에 지나칠 정도로 집착하지만, 코드를 재구성하는 중간 과정에서는 큰 덩어리로 뭉쳐지는데 개의치 않는다._**

### 6.2 함수 인라인

[절차]라 할 것도 없다.

**예시**

```jsx
function rating(aDriver) {
	return moreThanFiveLateDeliveries(aDriver) ? 2 : 1;
}

function moreThanFiveLateDeliveries(aDriver) {
	return aDriver.numberOfLateDeliveries > 5;
}

// 호출되는 함수의 리턴 값을 그대로 덮어씌우면 끝
function rating(aDriver) {
	return aDriver.numberOfLateDeliveries > 5 : 2 : 1;
```

**주의! - 함수 인라인을 적용하고 싶은데 뭔가 복잡하다면 그냥 포기하자. 복잡한 상황이라면 함수 인라인을 적용하면 안된다.**

---

### 정리

- 코드 수정을 할 때 함께 변경되는 애들은 **8.1 함수 옮기기**와 **8.2 필드 옮기기**로 모두 한 모듈에 묶어 버린다!
- 비슷한 데이터를 다루는 함수가 많으면 **6.9 여러 함수를 클래스로 묶기**를 적용한다.
- ㅁ데이터 구조를 변환하거나 보강(객체에 프로퍼티를 추가하거나 빼버릴 때)하는 함수들은 **6.10 여러 함수를 변환 함수로 묶기**를 적용한다.
- 어설프게 분리된 로직은 **6.2 함수 인라인**과 **7.6 클래스 인라인**을 적용한다.

---

| 이름       | 뒤엉킨 변경                                                                                                          | 산탄총 수술                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 원인       | 맥락을 잘 구분하지 못함                                                                                              | 맥락을 잘 구분하지 못함                                                      |
| 문제 현상  | 한 코드에 섞여들어감 (한 가지 변경사항을 충족하는 클래스가 아니라 여러가지 변경사항을 충족하는 클래스가 되어버린 것) | 여러 코드에 흩뿌려짐 (한 가지 변경사항이 일어났을 때 여러 클래스들이 변경됨) |
| 해법(원리) | 맥락을 명확히 구분시켜준다                                                                                           | 맥락을 명확히 구분시켜준다                                                   |
| 해법(행동) | 맥락별로 분리시켜준다                                                                                                | 맥락별로 모아준다                                                            |

---
