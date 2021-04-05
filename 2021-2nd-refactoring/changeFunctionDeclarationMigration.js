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
const newEnglanders = someCustomers.filter(c => xxNEWinNewEngland(c.address.state));

// 4. 이름 바꾸기
const newEnglanders = someCustomers.filter(c => inNewEngland(c.address.state));

function inNewEngland(stateCode) {
	return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}