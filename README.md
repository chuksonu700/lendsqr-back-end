
<h1 align="center">Demo Credit Backend Api</h1>

## A simple RestApi

This api can process the following
- Create an account 
- Add Funds to their Account
- Transfer funds to another User's Account 
- Withdraw funds from their account.


## Table of Content

- [A simple RestApi](#a-simple-restapi)
- [Table of Content](#table-of-content)
- [Create Account](#create-account)
- [User Details](#user-details)
- [Add Funds](#add-funds)
    - ["trans_type" must be equal to "Add-Money"](#trans_type-must-be-equal-to-add-money)
    - [amount should be less than 3000 because we are using a test Api](#amount-should-be-less-than-3000-because-we-are-using-a-test-api)
- [Transfer Funds](#transfer-funds)
    - ["trans_type" must be equal to "Transfer"](#trans_type-must-be-equal-to-transfer)
- [Withdraw Funds](#withdraw-funds)
    - [Sample Request](#sample-request)
- [Transaction History](#transaction-history)

Base Url 
```sh
https://chuks-onuigbo-lendsqr-be-test.herokuapp.com/api/v0
```

## Create Account
to create an account send a post request to "/users/create-account" 
with a body containing email and full_name example below

```javascript
var axios = require('axios');
var data = JSON.stringify({
  "email": "test@test.email",
  "full_name": "Test Name"
});

var config = {
  method: 'post',
  url: 'https://chuks-onuigbo-lendsqr-be-test.herokuapp.com/api/v0/users/create-account',
  headers: { 
    'Content-Type': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

```

Expected Response for Create Account 
```JSON
    {
        "id": "id-uuid-user-id-user-id",
        "email": "test@test.email",
        "full_name": "Test Name",
        "acc_bal": 0
    }
```
Or if user exist
```JSON
    {
        "message": "User Already Exist"
    }
```

## User Details
To get a user Details send a get request to "/users/:email" 
example below

```javascript
var axios = require('axios');
var data = '';

var config = {
  method: 'get',
  url: 'https://chuks-onuigbo-lendsqr-be-test.herokuapp.com/api/v0/users/test@test.email',
  headers: { },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

```
expected Response for created User 
```JSON
    {
        "id": "id-uuid-user-id-user-id",
        "email": "test@test.email",
        "full_name": "Test Name",
        "acc_bal": 0
    }
```
or 
```JSON
{
      "message": "No User Found"
}
```
## Add Funds
To Add Funds send a post request to "/transaction/add-money" with body containing "amount", "trans_type"="Add-Money",  "description", "email" and "full_name"

#### "trans_type" must be equal to "Add-Money"

see example below
```Javascript
var axios = require('axios');
var data = JSON.stringify({
  "amount": 2800,
  "trans_type": "Add-Money",
  "description": "my First Money",
  "email": "test@test.com",
  "full_name": "Test Name 2"
});

var config = {
  method: 'post',
  url: 'https://chuks-onuigbo-lendsqr-be-test.herokuapp.com/api/v0/transaction/add-money',
  headers: { 
    'Content-Type': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
```
#### amount should be less than 3000 because we are using a test Api
expected Response 
```JSON
{
    "status": "success",
    "message": "Hosted Link",
    "data": {
        "link": "https://ravemodal-dev.herokuapp.com/v3/hosted/pay/3b2e419e7d538e1ea08c"
    }
}
```
use the payment Link to make a deposit user click the link which opens a modal for making Payments

use on of the following cards
```
MasterCard PIN authentication 
Card number 5438898014560229 
CVV 564
PIN 3310
OTP 12345
Expiry 10/31 

Visa Card 3DS authentication 
Card number  4187427415564246
CVV 828
PIN 3310
OTP 12345
Expiry 09/32 

```

After Payment a Call Back Link is callled which verifies the Transaction 

## Transfer Funds
To Transfer Funds send a post request to "/transaction/transfer" with body containing "amount", "trans_type"="Transfer",  "description", "email_sender" and "email_reciever"

#### "trans_type" must be equal to "Transfer"

example
```Javascript
var axios = require('axios');
var data = JSON.stringify({
  "amount": 4000,
  "trans_type": "Transfer",
  "description": "please buy Airtime",
  "email_sender": "test@test.com",
  "email_reciever": "test2@test.com"
});

var config = {
  method: 'post',
  url: 'https://chuks-onuigbo-lendsqr-be-test.herokuapp.com/api/v0/transaction/transfer',
  headers: { 
    'Content-Type': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
```

expected Response
```JSON
{
    "message": "Completed Transfer of 4000 from test@test.com to test2@test.com with message please buy Airtime",
    "status": "Success"
}
```
or 
```JSON
{
    "message": "Invalid Reciever"
}
```
or
```JSON
{
    "message": "Insuficient Funds",
    "status": "Failed"
}
```
## Withdraw Funds
to withdraw Funds send a post request with body containing seee sample below to /transaction/withdraw
```JSON
{
    "amount":400,
    "trans_type":"Withdrawal",
    "description":"I need my Money",
    "email_sender":"test@test.com",
    "bank_acc_num":"0690000032",
    "bank_acc_name":"Chuks Onu",
    "bank":"Access Bank"
}
```
#### Sample Request
```Javascript
var axios = require('axios');
var data = JSON.stringify({
  "amount": 400,
  "trans_type": "Withdrawal",
  "description": "I need my Money",
  "email_sender": "test@test.com",
  "bank_acc_num": "0690000032",
  "bank_acc_name": "Chuks Onu",
  "bank": "Access Bank"
});

var config = {
  method: 'post',
  url: 'https://chuks-onuigbo-lendsqr-be-test.herokuapp.com/api/v0/transaction/withdraw',
  headers: { 
    'Content-Type': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

```

Expected Result
```JSON
{
    "status": "success",
    "message": "Transfer Queued Successfully",
    "data": {
        "id": 375304,
        "account_number": "0690000032",
        "bank_code": "044",
        "full_name": "Pastor Bright",
        "created_at": "2022-11-09T18:30:00.000Z",
        "currency": "NGN",
        "debit_currency": "NGN",
        "amount": 400,
        "fee": 10.75,
        "status": "NEW",
        "reference": "fd812d7d-0c04-46c6-93db-713d9d2605ad9_PMCKDU_1",
        "meta": null,
        "narration": "Payment for things",
        "complete_message": "",
        "requires_approval": 0,
        "is_approved": 1,
        "bank_name": "ACCESS BANK NIGERIA"
    }
}
```

## Transaction History
to get all transaction by a user send a get request to /transaction/:email

```Javascript
var axios = require('axios');

var config = {
  method: 'get',
  url: 'https://chuks-onuigbo-lendsqr-be-test.herokuapp.com/api/v0/transaction/test2@test.com',
  headers: { }
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
```

expected result
```JSON
[
    {
        "id": "a2d7e49d-b0a1-4e03-86e5-820b4c530395",
        "trans_type": "Transfer",
        "amount": 4000,
        "description": "Transfer of 4000 from test@test.com to test2@test.com with message please buy Airtime",
        "status": "Completed",
        "email_sender": "test@test.com",
        "email_reciever": "test2@test.com",
        "created_at": "2022-11-09T13:14:25.000Z"
    }
]
```