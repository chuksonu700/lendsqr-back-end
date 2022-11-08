"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const requests = require("supertest");
const baseURLs = "http://localhost:8000/api/v0/transaction";
describe("Fund Account", () => {
    let fundAccountDetails = {
        amount: 2300,
        description: "My first deposit",
        trans_type: "Add-Money",
        email: "test@test.com",
        full_name: "test Unit"
    };
    let fundAccountDetailsIncomplete = {
        amount: 2300,
        description: "My first deposit",
        trans_type: "Add-Money",
        email: "test@test.com",
    };
    it("should return 200", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield requests(baseURLs).post(`/add-money`).send(fundAccountDetails);
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.message).toBe("Hosted Link");
        expect(response.body.link).toBeDefined;
    }));
    it("return 400 Bad Request", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield requests(baseURLs).post(`/add-money`).send(fundAccountDetailsIncomplete);
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Bad Request");
    }));
});
// test fund account Callback dummy data
describe("Fund Account callback", () => {
    it("should return 200 and Complete Message", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield requests(baseURLs).get("/fund-account-callback?status=successful&tx_ref=56e37e53-3ff1-496f-b806-08d7f27d9ec5&transaction_id=3930798");
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Completed");
    }));
});
//transfer
describe("Transfer", () => {
    let transferDetails = {
        amount: 400,
        trans_type: "Transfer",
        description: "please buy Airtime",
        email_sender: "test@test.com",
        email_reciever: "test2@test.com"
    };
    let transferDetailsInComplete = {
        amount: 400,
        trans_type: "Transfer",
        email_sender: "test@test.com",
        email_reciever: "test2@test.com"
    };
    let transferDetailsInsufficientFunds = {
        amount: 40000,
        trans_type: "Transfer",
        description: "please buy Airtime",
        email_sender: "test2@test.com",
        email_reciever: "test@test.com"
    };
    let transferInvalidReciever = {
        amount: 4000,
        trans_type: "Transfer",
        description: "please buy Airtime",
        email_sender: "test2@test.com",
        email_reciever: "test@test787.com"
    };
    it("should return 200", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield requests(baseURLs).post(`/transfer`).send(transferDetails);
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("Success");
    }));
    it("return 400 Bad Request", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield requests(baseURLs).post(`/transfer`).send(transferDetailsInComplete);
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Bad Request");
    }));
    it("Insufficient Funds", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield requests(baseURLs).post(`/transfer`).send(transferDetailsInsufficientFunds);
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("Failed");
    }));
    it("Invalid Reciever", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield requests(baseURLs).post(`/transfer`).send(transferInvalidReciever);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid Reciever");
    }));
});
//withdraw
describe("Withdraw", () => {
    let withdrawDetails = {
        amount: 400,
        trans_type: "Withdrawal",
        description: "I need my Money",
        email_sender: "chuksonu700@gmail.com",
        bank_acc_num: "0690000032",
        bank_acc_name: "Chuks Onu",
        bank: "Access Bank"
    };
    it("Withdraw", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield requests(baseURLs).post(`/withdraw`).send(withdrawDetails);
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.data.account_number).toBe(withdrawDetails.bank_acc_num);
        expect(response.body.data.amount).toBe(withdrawDetails.amount);
        expect(response.body.data.fee).toBeDefined();
        expect(response.body.data.reference).toBeDefined();
    }));
    let withdrawBadRequest = {
        amount: -400,
        trans_type: "Withdrawala",
        description: "I need my Money",
        email_sender: "chuksonu700@gmail.compo",
        bank_acc_num: "0690000032",
        bank: "Access Bank"
    };
    it("Withdraw Bad Request", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield requests(baseURLs).post(`/withdraw`).send(withdrawBadRequest);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBeDefined();
    }));
    let withdrawInsufficientFunds = {
        amount: 40000000,
        trans_type: "Withdrawal",
        description: "I need my Money",
        email_sender: "chuksonu700@gmail.com",
        bank_acc_num: "0690000032",
        bank_acc_name: "Chuks Onu",
        bank: "Access Bank"
    };
    it("Withdraw Insufficient Funds", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield requests(baseURLs).post(`/withdraw`).send(withdrawDetails);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBeDefined();
        expect(response.body.Balance).toBeDefined();
    }));
});
//withdraw
describe("Withdraw callback", () => {
    let payload = {
        status: "success",
        message: "Transfer fetched",
        data: {
            id: 374880,
            account_number: "0690000032",
            bank_code: "044",
            full_name: "Pastor Bright",
            created_at: "2022-11-08T19:10:22.000Z",
            currency: "NGN",
            debit_currency: "NGN",
            amount: 400,
            fee: 10.75,
            status: "SUCCESSFUL",
            reference: "4f133fa0-d396-4a30-abe1-e5b979143f3f9_PMCKDU_1",
            meta: null,
            narration: "Payment for things",
            approver: null,
            complete_message: "Successful",
            requires_approval: 0,
            is_approved: 1,
            bank_name: "ACCESS BANK NIGERIA"
        }
    };
    it("Withdraw", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield requests(baseURLs).get(`/withdrawal-callback`).send(payload);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBeDefined();
    }));
});
//withdraw
describe("Users Transactions", () => {
    it("Transactions", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield requests(baseURLs).get(`/test@test.com`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();
    }));
});
