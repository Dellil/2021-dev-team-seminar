// 간단한 절차
// BEFORE
function circum(radius) {
	return 2 * Math.PI * radius;
}

// AFTER
function circumference(radius) {
	return 2 * Math.PI * radius;
}



// 마이그레이션 절차
function circum(radius) {
	return circumference(radius);
}

function circumference(radius) {
	return 2 * Math.PI * radius;
}



// 마이그레이션 절차 상황2 (매개변수를 객체에서 객체의 속성으로 받게끔 바꾸기)
function inNewEngland(aCustomer) {
	return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(aCustomer.address.state);
}

const newEngladers = someCustomers.filter(c => inNewEngland(c));