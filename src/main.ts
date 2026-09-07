type Transaction = {
    id: number;
    title: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
};

let transactions: Transaction[] = [
    {
        id: 1,
        title: "Grocery Shopping",
        amount: 1200,
        type: "expense",
        category: "Food",
        date: "2026-09-01"
    },
    {
        id: 2,
        title: "Freelance Work",
        amount: 5000,
        type: "income",
        category: "Work",
        date: "2026-09-02"
    },
    {
        id: 3,
        title: "Bus Pass",
        amount: 800,
        type: "expense",
        category: "Travel",
        date: "2026-09-03"
    },
    {
        id: 4,
        title: "Dinner",
        amount: 600,
        type: "expense",
        category: "Food",
        date: "2026-09-04"
    },
    {
        id: 5,
        title: "Salary",
        amount: 15000,
        type: "income",
        category: "Work",
        date: "2026-09-05"
    },
    {
        id: 6,
        title: "Electricity Bill",
        amount: 1500,
        type: "expense",
        category: "Bills",
        date: "2026-09-06"
    }
];

let nextId = 1;

const title_input = document.getElementById("title_input") as HTMLInputElement;
const amount_input = document.getElementById("amount_input") as HTMLInputElement;
const category_input = document.getElementById("category_input") as HTMLInputElement;
const date_input = document.getElementById("date_input") as HTMLInputElement;
const option_input = document.getElementById("option") as HTMLSelectElement;

const balanceDiv = document.getElementById("balance") as HTMLDivElement;
const incomeDiv = document.getElementById("income") as HTMLDivElement;
const expenseDiv = document.getElementById("expense") as HTMLDivElement;

const ADDbtn = document.getElementById("ADDBtn");

ADDbtn?.addEventListener("click", passTransaction);

const transactionContainer = document.getElementById("show_transactions") as HTMLDivElement;


function addTransaction(
    title: string,
    amount: number,
    type: "income" | "expense",
    category: string,
    date: string
) {
    const newTransaction: Transaction = {
        id: nextId,
        title,
        amount,
        type,
        category,
        date
    };
    if (
    title === "" ||
    category === "" ||
    date === "" ||
    amount_input.value === "" ||
    amount<=0
) {
    return;
}

    transactions.push(newTransaction);
    nextId++;

    title_input.value = "";
    amount_input.value = "";
    category_input.value = "";
    date_input.value = "";
    option_input.value = "";
}

function passTransaction() {
    const title = title_input.value;
    const amount = Number(amount_input.value);
    const category = category_input.value;
    const date = date_input.value;
    const option = option_input.value as "income" | "expense";

    addTransaction(
        title,
        amount,
        option,
        category,
        date
    );

    renderTransactions();

    updateChart();
}
function renderTransactions() {
    transactionContainer.innerHTML = transactions.map(transaction => {
        return `
            <div class="transaction-card" data-id="${transaction.id}">
                <h3>Title: ${transaction.title}</h3>
                <p>Type: ${transaction.type}</p>
                <p>Amount: ${transaction.amount}</p>
                <p>Date: ${transaction.date}</p>
                <p>Category: ${transaction.category}</p>
                <button onclick="deleteTransaction(this)">Delete</button>
                <button onclick="editTransaction(this)">Edit</button>
            </div>
            `;
    }).join("");
}
function deleteTransaction(button: HTMLButtonElement) {
    const div = button.parentElement as HTMLDivElement;
    const id = Number(div.dataset.id);

    transactions = transactions.filter(transaction => transaction.id !== id);

    renderTransactions();   
    updateChart(); 
    updateSummary();
}
renderTransactions();
updateSummary();
let edit_title = document.getElementById("edit-title") as HTMLInputElement;
let edit_amount = document.getElementById("edit-amount") as HTMLInputElement;
let edit_type = document.getElementById("edit-type") as HTMLSelectElement;
let edit_category = document.getElementById("edit-category") as HTMLInputElement;
let edit_date = document.getElementById("edit-date") as HTMLInputElement;

let editingId: number | null = null;

const editModal = document.getElementById("edit-modal") as HTMLDivElement;

const SaveEdit = document.getElementById("save-edit");
SaveEdit?.addEventListener("click", SaveEditData)

function editTransaction(button: HTMLButtonElement){
    const div = button.parentElement as HTMLDivElement;
    const id = Number(div.dataset.id);

    editingId = id;

    const transaction = transactions.find(t => t.id === id);

    if (!transaction) {
    return;
}

    edit_title.value = transaction?.title;
    edit_amount.value = String(transaction?.amount);
    edit_type.value = transaction.type;
    edit_category.value = transaction.category;
    edit_date.value = transaction.date;

    editModal.style.display = "grid";
    
}
function SaveEditData() {
    if (editingId === null) {
        return;
    }

    const transaction = transactions.find(t => t.id === editingId);

    const amount = Number(edit_amount.value);

if (!transaction || amount <= 0) {
    return;
}

    transaction.amount = amount;
    transaction.title = edit_title.value;
    transaction.type = edit_type.value as "income" | "expense";
    transaction.category = edit_category.value;
    transaction.date = edit_date.value;

renderTransactions();
updateChart();

editModal.style.display = "none";
}
const CancelEdit = document.getElementById("cancel-edit");

CancelEdit?.addEventListener("click", () => {
    editModal.style.display = "none";
});

console.log(transactions);


(window as any).deleteTransaction = deleteTransaction;
(window as any).editTransaction = editTransaction;
(window as any).SaveEditData = SaveEditData;

function incomeAndExpense() {
    let income = 0;
    let expense = 0;

    transactions.map(t => {
        if (t.type === "expense") {
            expense += t.amount;
        }

        if (t.type === "income") {
            income += t.amount;
        }
    });
    return {income, expense}
}

const totals = incomeAndExpense();

const balance: number = totals.income - totals.expense;

function Category_income_expense() {
    const categoryTotals: {
        [category: string]: {
            income: number;
            expense: number;
        };
    } = {};

    transactions.forEach(t => {

        if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = {
                income: 0,
                expense: 0
            };
        }

        if (t.type === "income") {
            categoryTotals[t.category]!.income += t.amount;
        }

        if (t.type === "expense") {
            categoryTotals[t.category]!.expense += t.amount;
        }
    });

    return categoryTotals;
}

ADDbtn?.addEventListener("click", Category_income_expense);

const chartCanvas = document.getElementById("expenseChart") as HTMLCanvasElement;

declare const Chart: any;
function createCategoryChart() {
    const categories_data = Category_income_expense();

    const labels = Object.keys(categories_data);

    const expenseData = labels.map(category =>
    categories_data[category]!.expense
);

const incomeData = labels.map(category =>
    categories_data[category]!.income
);

    return new Chart(chartCanvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Expense",
                    data: expenseData
                },
                {
                    label: "Income",
                    data: incomeData
                }
            ]
        }
    });
}

const chart = createCategoryChart();

function updateChart() {
    const categories_data = Category_income_expense();

    const labels = Object.keys(categories_data);

    const expenseData = labels.map(category =>
        categories_data[category]!.expense
    );

    const incomeData = labels.map(category =>
        categories_data[category]!.income
    );

    chart.data.labels = labels;

    chart.data.datasets[0].data = expenseData;
    chart.data.datasets[1].data = incomeData;

    chart.update();
}

function updateSummary() {
    const totals = incomeAndExpense();

    const balance = totals.income - totals.expense;

    balanceDiv.textContent = `Balance: ₹${balance}`;
    incomeDiv.textContent = `Income: ₹${totals.income}`;
    expenseDiv.textContent = `Expense: ₹${totals.expense}`;
}