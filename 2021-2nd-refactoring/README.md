- 이번 주는 이런 것을 다룹니다.
  - 리팩터링의 정의
  - 리팩터링하는 이유
  - 언제 리팩터링을 하는지
  - 코드스멜은 무엇이고 어떤게 있는지
  - 약간의 리팩터링 기법들

## 리팩터링의 정의

### 명사형 정의

`소프트웨어의 겉보기 동작을 유지한 채, 코드를 이해하고 수정하기 쉬운 형태로 내부 구조를 변경하는 기법`

### 동사형 정의

`소프트웨어의 겉보기 동작을 유지한 채, 리팩터링 기법을 적용해 소프트웨어를 재구성하다`

ex → 리팩터링을 두 시간 정도 할 것 같은데, 여러 리팩토링 기법을 적용할 것 같다.

**겉보기 동작?** → 리팩토링 전과 후의 코드 동작이 똑같아야 되서 겉보기 동작이라 명함

ex →

- 같은 UI를 보여줘야 함, 같은 이벤트일때 같은 행동을 보여줘야 함
- 같은 입력, 같은 출력

버그가 있었으면 그 버그 마저 있는 대로 동작 (물론 남들이 발견 못한 버그는 고쳐도 괜찮다!)

정리 →

- 리팩터링하다 라는건 한번에 바꿀 수 있는 코드를 여러 단계로 나눠 특정 방식으로 코드를 정리해 소프트웨어의 겉보기 동작을 유지하는 것
- 이런 단계들을 순차적으로 연결해 큰 변화를 만드는 것
- **다음 주에 본격적인 발표에 앞서 위 정리의 구체적 예시 보여주기**

---

## 리팩터링하는 이유

**프로그래밍 속도를 높일 수 있기 때문임**

- 리팩터링을 하는데 시간이 드니 전체 개발 속도는 떨어지는 건 아닐까요?
  - 새로운 기능을 추가 할 수 록 기존 코드 베이스에 녹이는 시간이 상승
    - 기능 추가하다 버그 펑! 터지면 버그 해결하는 시간도 걸림
    - **이 상황이 계속되면 그냥 처음부터 다시 만드는 편이 낫다는 결론에 도달하게 됨**

즉 리팩터링하며 기능 추가하는 시간 <<<<< 기능 추가만 하는 시간 이라는 것

위의 사례를 그래프로 그려보면 이렇게 나옴

![1](https://user-images.githubusercontent.com/42995061/113676001-ea2ef800-96f6-11eb-96ed-0a4635e64c18.png)

![2](https://user-images.githubusercontent.com/42995061/113676006-eb602500-96f6-11eb-9162-62f818a2b8c4.png)

이걸 설계-지구력 가설(Design Stamina Hypothesis)라 부름

- 내부 설계에 심혈을 기울이면 소프트웨어의 지구력이 높아져 기능을 더 빠르게 추가 할 수 있음

정리 → 리팩터링을 하면 설계를 지속해서 개선할 수 있고, 개선된 설계는 빠른 개발을 할 수 있으므로 리팩터링을 해야됨 즉, 더 적은 노력으로 더 많은 가치를 내기 위해 경제적인 이유로 리팩터링을 한다.

---

## 언제 리팩터링을 할까

- 준비를 위한 리팩터링 → 기능을 쉽게 추가하게 만들기
- 이해를 위한 리팩터링 → 코드를 이해하기 쉽게 만들기
- 쓰레기 줍기 리팩터링 → 나중에 일을 낭비하려 하는 것들 치우기
- 계획된 리팩터링 & 수시로 하는 리팩터링
- 오래 걸리는 리팩터링

### 그러면 언제 안할까?

- 지저분한 코드를 발견해도 수정할 필요가 없는 경우
  - 일회용 코드
  - 외부 API 다루듯 호출하는 경우
- 리팩터링보다 처음 만드는게 더 빠른 경우

**정리 → 그냥 코딩할 때마다 리팩터링 하자**

---

## 코드 스멜

켄트 벡과 마틴 파울러는 리팩터링이 필요한, 때로는 아주 절실한 코드들에는 일정한 패턴들이 있다는걸 알게됨

## 3.1 기이한 이름 (Mysterious Name)

`추리 소설이라면 무슨 일이 전개되는지 궁금증을 지어낼 수록 좋지만, 코드는 아니다. 세계적인 기인이라는 느낌을 풍기고 싶더라도 꾹 참고 코드는 단순하고 명료하게 작성해야 한다.`

코드를 명료하게 표현하는 데 가장 중요한 요소 하나는 바로 '이름'이다

- **함수 선언 바꾸기 (6.5절, 함수 이름을 바꿀 때도 사용한다.)**
- 변수 이름 바꾸기 (6.7절)
- 필드 이름 바꾸기 (9.2절)

마땅한 이름이 떠오르지 않는다면 설계에 더 근본적인 문제가 숨어 있을 가능성이 더 높다. 그래서 혼란스러운 이름만 잘 정리하면 코드가 훨씬 더 간결해질 때가 많다.

## 3.2 중복 코드 (Duplicated Code)

같은 코드 구조가 여러 곳에서 반복된다면 하나로 통합하여 더 나은 프로그램을 만들 수 있다.

코드가 중복되면 각각을 볼 때마다 서로 차이점은 없는지 주의 깊게 살펴봐야 하는 부담이 생긴다. 그래서 그중 하나를 변경할 때, 다른 비슷한 코드들도 모두 살펴보고 적절히 수정해야 한다.

- **함수 추출하기 (6.1절)**
- (코드가 비슷하긴 한데, 완전히 같지 않다면) 문장 슬라이드 후 함수 추출하기 (8.6절)
- (같은 부모로부터 파생 된 서브 클래스들에 코드중복) 메서드 올리기 (12.1절)

---

## 3.1 기이한 이름

- **함수 선언 바꾸기 (6.5절, 함수 이름을 바꿀 때도 사용한다.)**
- 변수 이름 바꾸기 (6.7절)
- 필드 이름 바꾸기 (9.2절)

### 6.5 함수 선언 바꾸기 (Change Function Declaration)

함수는 프로그램을 잘게 나누는 주된 수단으로 함수 선언은 각 부분의 서로 맞물리는 방식을 표현하며 프로그램의 각 부분을 조립하는 연결부 역할을 한다.

이 연결부(함수)에서 가장 중요한 건 함수의 이름이다. 이름이 좋으면 함수의 구현 코드를 보지 않고 호출문만 봐도 무슨 일을 하는지 파악할 수 있지만 좋은 이름을 떠올리는 것은 쉽지 않다. 저자(마틴 파울러) 또한 적합한 이름을 단번에 지은 적은 거의 없다. 그리고 의미가 제대로 와닿지 않는 이름을 발견해도 그대로 놔두고 싶은데 그러지 말자.

이름이 잘못된 함수를 발견하면 더 나은 이름으로 즉시 바꾸자. 그래야 그 코드를 다시 볼 때 무슨 일을 하는지 '또' 고민 할 필요가 없으니까

매개변수 또한 마찬가지다. 함수의 매개변수는 함수가 외부 세계(자신의 선언문 바깥의 코드들)와 어우러지는 방식을 정의한다. 또한 함수를 사용하는 문맥(context)을 설정한다. 그 예로 전화번호 포매팅 함수가 매개변수로 사람을 받는다 해보자. 그럼 회사 전화번호 포매팅에는 사용할 수 없다. 하지만 사람 번호, 회사 번호를 가려 받지 않고 **번호 그 자체만 받도록 정의하면 이 함수의 활용 범위를 넓힐 수 있다.** (그림 만들면 좋을 듯)

이렇게 해서 다른 모듈과 결합을 제거할 수 있다곤 하지만 매개변수를 올바르게 선택하기란 실제 프로그램 개발은 엄청난 복잡도를 띄고 있으므로 그때마다 상황에 맞춰 함수 선언 바꾸기 기법을 적용해야 된다. (대충 정답은 없다 라는 뜻)

그렇기 때문에 이 리팩토링 기법은 `간단한 절차` 와 더 세분화 된 `마이그레이션 절차` 가 있다.

**간단한 절차**

- 매개변수 제거할거면 함수 본문에서 매개변수를 참조하는 곳은 없는지 확인한다.
- 함수 선언을 원하는 형태로 바꿈
- 함수 선언을 참조하는 부분을 모두 찾아 바꾼다.
- 테스트한다.

Tips) 이름 변경과 매개변수 추가를 하고 싶다면 각각을 독립적으로 처리, 다만 문제가 생기면 되돌리고 마이그레이션 절차로 처리한다.

**마이그레이션 절차**

- 앞의 함수 추출단계를 수월하게 만들어야 한다면 함수의 본문을 적절히 리팩터링한다.
- 함수 본문을 `함수 추출`한다.
- 추출한 함수에 매개변수를 추가해야 한다면 `간단한 절차` 를 따라 추가한다.
- 테스트
- 기존 함수 인라인하기
- 이름을 임시로 붙여뒀다면 함수 선언 바꾸기를 한번 더 적용해 원래 이름으로 되돌린다.
- 테스트

예시 코드

- 간단한 절차

  ```jsx
  // BEFORE
  function circum(radius) {
    return 2 * Math.PI * radius;
  }

  // AFTER
  function circumference(radius) {
    return 2 * Math.PI * radius;
  }
  ```

- 마이그레이션 절차

  ```jsx
  function circum(radius) {
    return circumference(radius);
  }

  function circumference(radius) {
    return 2 * Math.PI * radius;
  }
  ```

- 마이그레이션 절차 (매개변수를 객체에서 객체의 속성으로 받게끔 바꾸기)

  ```jsx
  function inNewEngland(aCustomer) {
    return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(
      aCustomer.address.state
    );
  }

  // 아래 코드는 호출문
  const newEngladers = someCustomers.filter((c) => inNewEngland(c));
  ```

  **고객**이 거주하는 주 이름을 보고 뉴잉글랜드에 사는지 판별하는 함수에서 그냥 주 식별코드만 매개변수로 받도록 리팩터링

  (이러면 고객에 관한 의존성이 제거됨)

  ```jsx
  // 1. 함수 추출에 앞서 매개변수를 주 이름(stateCode)으로 받게끔 바꾸기
  function inNewEngland(aCustomer) {
    const stateCode = aCustomer.address.state;
    return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
  }

  // 2. 함수 추출로 새 함수 만들기
  function inNewEngland(aCustomer) {
    return xxNEWinNewEngland(aCustomer.address.state);
  }

  function xxNEWinNewEngland(stateCode) {
    return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
  }

  // 3. 함수 인라인하기
  const newEnglanders = someCustomers.filter((c) =>
    xxNEWinNewEngland(c.address.state)
  );

  // 4. 이름 바꾸기
  const newEnglanders = someCustomers.filter((c) =>
    inNewEngland(c.address.state)
  );

  function inNewEngland(stateCode) {
    return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
  }

  const result = inNewEngland("MA");
  let string = "";
  result; // true or false
  if (result) {
    string = "그런 좋은 동네에 사시다니 부럽네요!";
  }
  return string;
  ```

### 6.7 변수 이름 바꾸기 && 9.2 필드 이름 바꾸기

이름 바꾸고 테스트하면 끝!

---

## 3.2 중복 코드

- **함수 추출하기 (6.1절)**
- (코드가 비슷하긴 한데, 완전히 같지 않다면) 문장 슬라이드(8.6절) 후 함수 추출하기
- (같은 부모로부터 파생 된 서브 클래스들에 코드중복) 메서드 올리기 (12.1절)

### 6.1 함수 추출하기 (Extract Function)

저자가 가장 많이 사용하고 있는 리팩터링 기법중 하나

그럼 **함수를 추출하는 기준은 무엇이 있을까?**

- '목적과 구현을 분리'하는 방식이 가장 합리적인 기준으로 **보임**
- 코드를 보고 무슨 일을 하는지 이해하는데 한참의 시간이 소요된다면...
  - 그 부분을 함수로 추출해서 '무슨 일'에 걸맞는 이름을 붙여주자

길이가 중요하진 않다고 함

절차

1. 함수를 새로 만들고 목적을 잘 드러내는 이름 붙이기 ('어떻게'가 아닌 '무엇을' 하는지가 드러나야 함!)
2. 추출할 코드를 원본 함수에서 복사해 새 함수에 붙여넣기
3. 추출한 코드 중 원본 함수의 지역 변수를 참조하거나 추출 함수의 유효범위를 벗어나는 변수는 없는지 검사한다. 만약 있다면 매개변수로 전달!
4. 원본 함수에서 추출한 함수로 일을 위임한다.
5. 테스트!

예시 코드 (상황 1, 2, 3이 있는데 1→2→3으로 코드가 변형됨)

```jsx
function printOwing(invoice) {
  let outstanding = 0;

  console.log("******************");
  console.log("**** 고객 채무 ****");
  console.log("******************");

  // 미해결 채무(outstanding)를 계산한다.
  for (const o of invoice.orders) {
    outstanding += o.amount;
  }

  // 마감일을 기록한다.
  const today = Clock.today;
  invoice.dueDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 30
  );

  console.log(`고객명: ${invoice.customer}`);
  console.log(`남은 빚: ${outstanding}`);
  console.log(`남은 기간: ${invoice.dueDate.toLocaleDateString()}`);
}
```

상황 1) 유효 범위를 벗어나는 변수가 없을 때

```jsx
function printOwing(invoice) {
  let outstanding = 0;

  printBanner();

  // 미해결 채무(outstanding)를 계산한다.
  for (const o of invoice.orders) {
    outstanding += o.amount;
  }

  // 마감일을 기록한다.
  const today = Clock.today;
  invoice.dueDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 30
  );

  printDetails();

  function printDetails() {
    console.log(`고객명: ${invoice.customer}`);
    console.log(`고객명: ${outstanding}`);
    console.log(`고객명: ${invoice.dueDate.toLocaleDateString()}`);
  }
}

function printBanner() {
  console.log("******************");
  console.log("**** 고객 채무 ****");
  console.log("******************");
}
```

상황 2) 지역 변수를 사용할 때

```jsx
function printOwing(invoice) {
  let outstanding = 0;

  printBanner();

  // 미해결 채무(outstanding)를 계산한다.
  for (const o of invoice.orders) {
    outstanding += o.amount;
  }

  // 마감일을 기록한다.
  recordDueDate(invoice);

  printDetails(invoice, outstanding);
}
function recordDueDate(invoice) {
  const today = Clock.today;
  invoice.dueDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 30
  );
}

function printDetails(invoice, outstanding) {
  console.log(`고객명: ${invoice.customer}`);
  console.log(`고객명: ${outstanding}`);
  console.log(`고객명: ${invoice.dueDate.toLocaleDateString()}`);
}

function printBanner() {
  console.log("******************");
  console.log("**** 고객 채무 ****");
  console.log("******************");
}
```

상황 3) 지역 변수의 값을 변경할 때

```jsx
function printOwing(invoice) {
  printBanner();
  const outstanding = calculateOutstanding(invoice);
  recordDueDate(invoice);
  printDetails(invoice, outstanding);
}

function calculateOutstanding(invoice) {
  let result = 0;
  for (const o of invoice.orders) {
    result += o.amount;
  }
  return result;
}

function recordDueDate(invoice) {
  const today = Clock.today;
  invoice.dueDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 30
  );
}

function printDetails(invoice, outstanding) {
  console.log(`고객명: ${invoice.customer}`);
  console.log(`고객명: ${outstanding}`);
  console.log(`고객명: ${invoice.dueDate.toLocaleDateString()}`);
}

function printBanner() {
  console.log("******************");
  console.log("**** 고객 채무 ****");
  console.log("******************");
}
```

### 12.1 메서드 올리기 (Pull Up Method)

절차

1. 똑같이 동작하는 메소드인지 살펴본다.
2. 슈퍼클래스에서 사용하고 싶은 형태로 통일한다.
3. 슈퍼클래스에 새 메서드를 만든다.
4. 서브 클래스중 하나의 메서드를 없애고 테스트 해본다.
5. 모든 서브 클래스의 메서드가 없어질 때까지 다른 서브클래스의 메서드를 하나씩 제거한다.

```jsx
// BEFORE
// Party를 상속한 Employee 클래스...
get annualCost() {
	return this.monthlyCost * 12;
}

// Party를 상속한 Department 클래스...
get totalAnnualCost() {
	return this.monthlyCost * 12;
}

// AFTER
// Party 클래스
get annualCost() {
	return this.monthlyCost * 12;
}

// 한 서브 클래스 메서드 제거한 뒤 테스트 후, 모든 서브 클래스 메서드 제거
```

---

## 느낀 것들

**리팩터링은 다음을 생각하게 해줌**

예시) 모바일 웹의 myFiles 구조 개선이었음 myFiles는 사용자가 파일을 올리고, 보고, 이것저것요것그것 다 할 수 있는 중요한 곳임

바뀌기 전의 구조는 이럼

![RULE](https://user-images.githubusercontent.com/42995061/113676009-eb602500-96f6-11eb-80e9-cf42a660c208.png)

모바일웹의 myFiles 컴포넌트의 구조를 바꾸기 위해 어제 실제로 문장 슬라이드와 함수 추출하기를 써봤음

결과는 이럼

![RULE2](https://user-images.githubusercontent.com/42995061/113676021-edc27f00-96f6-11eb-93f1-020517be84b6.png)

모드별로 컴포넌트들을 그냥 다 모아버림

그러다 든 생각

- 각 컴포넌트들이 mode를 받아, 자신들이 렌더링될건지 스스로 결정한다면?

각 컴포넌트들이 mode를 갖는 방법...

1. 모드 설정 커스텀훅을 만들어서 각각 컴포넌트에서 커스텀 훅을 사용
2. 아님 부모 컴포넌트에서 mode 상태를 갖고 있게 하고 prop driling을 이용하는 방법
   - 모드를 바꾸는 위치는 다 다르므로 첫 번째 방법이 낫다. 안 그러면 엄청나게 prop driling 되서 보기 안 좋음

이처럼 리팩터링은 내가 다음에 할 것을 차근차근 생각하게 해줘서 개발자를 처음부터 멘붕에 빠뜨리지 않게 함

또한 코드를 보면 이건 ~~하는 코드구나~ 를 넘어서, `A 기능이 추가된다면 어떤 구조가 편할까?` 까지 고민하게 됨

두 줄 요약 → (

- 주니어개발자라면 의식적인 리팩터링을 해보자
- 문장 슬라이드와 함수 추출은 좋은 리팩터링 기법
  )
