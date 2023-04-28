'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelTime = document.querySelector('.time');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnLogout = document.querySelector('.logout__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSortAmount = document.querySelector('.sort--amount');
const btnSortDate = document.querySelector('.sort--date');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const formLogin = document.querySelector('.login');

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
// Helper functions
const date = new Date();
const currentDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
const currentTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
labelDate.textContent = currentDate;
labelTime.textContent = currentTime;

// Create usernames
const createUsernames = accs => {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

// Update UI
const displayMovements = function (movements, sort = true) {
  containerMovements.innerHTML = '';
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">3 days ago</div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = acc => {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = acc => {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(outcomes)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

const updateUI = acc => {
  displayMovements(acc.movements);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

/////////////////////////////////////////////////
// Helper functions
let currentAccount;

const loginUser = accounts => {
  // find if there is an active user in the accounts
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // find if the pin is correct
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // display a welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    // add to session storage
    sessionStorage.setItem('userLogin', [currentAccount.username, true]);
    // hidden the login fields
    document.getElementById('login').style.display = 'none';
    document.getElementById('logout').style.display = 'block';
    // display UI and message
    containerApp.style.opacity = 100;
    // update UI
    updateUI(currentAccount);
  }
};

const logoutUser = () => {
  // remove from session storage
  sessionStorage.setItem('userLogin', false);
  // turn to the initial conditions
  containerApp.style.opacity = 0;
  document.getElementById('logout').style.display = 'none';
  document.getElementById('login').style.display = 'block';
  inputLoginUsername.value = '';
  inputLoginPin.value = '';
};

const transferMoney = (accounts, amount) => {
  // find the account to transfer
  const receiverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  // check if the amount is valid
  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount?.username !== currentAccount.username
  ) {
    // do the transfer
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);
    // update UI
    updateUI(currentAccount);
    // clean the inputs fields
    inputTransferTo.value = '';
    inputTransferAmount.value = '';
  } else {
    // display an error message
    alert('Invalid transfer');
  }
};

const loanMoney = amount => {
  if (amount > 0) {
    // process the credit transfer
    currentAccount.movements.push(amount);
    // update UI
    updateUI(currentAccount);
    // clean the inputs fields
    inputLoanAmount.value = '';
  }
};

const closeAccount = () => {
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // Delete account
    accounts.splice(index, 1);
    // Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
  labelWelcome.textContent = '';
};

/////////////////////////////////////////////////
// Event handlers
btnLogin.addEventListener('click', e => {
  e.preventDefault();
  loginUser(accounts);
});

btnLogout.addEventListener('click', e => {
  e.preventDefault();
  logoutUser();
});

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  transferMoney(accounts, amount);
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  loanMoney(amount);
});

let sorted = false;
btnSortAmount.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

btnSortDate.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

btnClose.addEventListener('click', e => {
  e.preventDefault();
  closeAccount();
  logoutUser();
});

/////////////////////////////////////////////////
// Prevent refreshing to logout
const currentUsername = sessionStorage.getItem('userLogin').split(',')[0];
const isLoggedIn = sessionStorage.getItem('userLogin').split(',')[1];

if (isLoggedIn === 'true') {
  document.getElementById('login').style.display = 'none';
  document.getElementById('logout').style.display = 'block';
  // display UI and message
  containerApp.style.opacity = 100;

  // update UI
  updateUI(currentAccount);
} else {
  containerApp.style.opacity = 0;
  document.getElementById('logout').style.display = 'none';
  document.getElementById('login').style.display = 'block';
  inputLoginUsername.value = '';
  inputLoginPin.value = '';
}

const mins = 4;
const secs = 0.0;

labelTimer.textContent = `${minutes}:${seconds}`;
startTimer();

function startTimer() {
  var presentTime = labelTimer;
  var timeArray = presentTime.split(/[:]+/);
  var m = timeArray[0];
  var s = checkSecond(timeArray[1] - 1);
  if (s == 59) {
    m = m - 1;
  }
  if (m < 0) {
    return;
  }

  labelTimer = m + ':' + s;
  console.log(m);
  setTimeout(startTimer, 1000);
}

function checkSecond(sec) {
  if (sec < 10 && sec >= 0) {
    sec = '0' + sec;
  } // add zero in front of numbers < 10
  if (sec < 0) {
    sec = '59';
  }
  return sec;
}
