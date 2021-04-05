// 상황 3) 지역 변수의 값을 변경할 때
function printOwing(invoice) {
	printBanner();
	const outstanding = calculateOutstanding(invoice);
	recordDueDate(invoice);
	printDetails(invoice, outstanding);
}

function calculateOutstanding(invoice) {
	let result= 0;
	for(const o of invoice.orders) {
		result += o.amount;
	}
	return result;
}

function recordDueDate(invoice) {
	const today = Clock.today;
	invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
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