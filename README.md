
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
- [Withdraw Funds](#withdraw-funds)
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
To Add Funds send a post request to "//transaction/add-money" with body containing "amount", "trans_type"="Add-Money",  "description", "email" and "full_name"

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

```
## Transfer Funds
## Withdraw Funds
## Transaction History