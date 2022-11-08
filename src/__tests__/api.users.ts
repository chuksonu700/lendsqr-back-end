const request = require("supertest");
const baseURL = "http://localhost:8000/api/v0/users";

describe("GET User Details",() => {
  
  it("should return 201 No User Found", async () => {
    const response = await request(baseURL).get("/test@asasatest.com");
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('No User Found');
  });
  
  it("should return 200 and email", async () => {
    const response = await request(baseURL).get("/test@test.com");
    expect(response.statusCode).toBe(200);
    expect(response.body[0].email).toBe("test@test.com");
  });
});


describe("Create account",() => {
  let genEmail = `test-${Math.ceil(Math.random()*1000000000)}@test.com`
  let newAcc= {
    email:genEmail,
    full_name:"test Unit"
  }
  let newAcc2= {
    email:"test@test.com",
    full_name:"test Unit"
  }
  it("should return 200", async () => {
  const response = await request(baseURL).post("/create-account").send(newAcc);
    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe(newAcc.email);
  });
  it("User already exist", async () => {  
  const response = await request(baseURL).post("/create-account").send(newAcc2);
  expect(response.statusCode).toBe(201);
  expect(response.body.message).toBe("User Already Exist"); 
  });
});