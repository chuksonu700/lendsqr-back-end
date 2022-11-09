
    <h1 align="center">Demo Credit Backend Api</h1>
<h4 align="center">A simple rest api that allows the User to</h4>

<ul>
    <li>create an account</li>
    <li>create an account</li>
    <li>transfer funds to another user’s account</li>
    <li>withdraw funds from their account.</li>
</ul>

<p>Api Url is https://chuks-onuigbo-lendsqr-be-test.herokuapp.com/api/v0</p>

### Create an Account
to create an account send a post request to "/users/create-account 
e.g https://chuks-onuigbo-lendsqr-be-test.herokuapp.com/api/v0/users/create-account"
with a body
<code>
    {
        "email":"test@test.com",
        "full_name":"test Unit"
    }
</code>

expected Response for created User 
<code>
    {
        "id": "id-uuid-user-id-user-id",
        "email": "test@test.com",
        "full_name": "test Unit",
        "acc_bal": 0
    }
</code>
Or 
<code>
    {
        "message": "User Already Exist"
    }
</code>

## User Details
to get a user Details send a get request to "/users/:email" 
e.g https://chuks-onuigbo-lendsqr-be-test.herokuapp.com/api/v0/users/test@test.com
expected Response for created User 
<code>
    {
        "id": "id-uuid-user-id-user-id",
        "email": "test@test.com",
        "full_name": "test Unit",
        "acc_bal": 0
    }
</code>
