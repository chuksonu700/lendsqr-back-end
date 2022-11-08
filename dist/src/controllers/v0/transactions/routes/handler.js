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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTransactions = exports.withdrawalCallback = exports.withdraw = exports.transferRoute = exports.fundAccountCallback = exports.addMoney = void 0;
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../../../../config/config"));
const Flutterwave = require('flutterwave-node-v3');
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("./utils");
// setting up envroment variable
dotenv_1.default.config();
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const knex = require('knex')(config_1.default);
const addMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, description, trans_type, email, full_name } = req.body;
    const validatUserEmail = yield (0, utils_1.verifyEmail)(email);
    if (!amount || amount < 1 || !description || trans_type !== "Add-Money" || !email || !full_name || validatUserEmail == false) {
        //incomplete Details
        res.status(400).send({ error: "Bad Request" });
    }
    else {
        const id = yield (0, uuid_1.v4)();
        const newTransaction = {
            id,
            email_sender: email,
            trans_type,
            amount,
            description,
        };
        try {
            const saved = yield (0, utils_1.savePendindgTransaction)(newTransaction);
            const linkJson = yield (0, utils_1.getFundAccountLink)(email, amount, id, full_name);
            res.status(201).send(linkJson);
        }
        catch (error) {
            console.log(error);
            res.status(501).send(`Could Not Generate Addmoney Link`);
        }
    }
});
exports.addMoney = addMoney;
//fund account callback
const fundAccountCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // verify transaction
    let status = req.query.status;
    //cancelled transaction
    if (status == "cancelled") {
        const updateCancelledTransaction = yield (0, utils_1.cancelledTransaction)(req.query.tx_ref);
        res.status(400).send({ message: updateCancelledTransaction });
    }
    else {
        const runVerify = yield (0, utils_1.VerifyAddMOneyTransaction)(req.query.tx_ref, req.query.transaction_id);
        res.status(201).send({ message: runVerify });
    }
});
exports.fundAccountCallback = fundAccountCallback;
//transfers
const transferRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, description, trans_type, email_sender, email_reciever, } = req.body;
    if (!amount || !description || trans_type !== "Transfer" || !email_reciever || !email_sender || amount < 1) {
        //incomplete Details
        res.status(400).send({ error: "Bad Request" });
        return;
    }
    //verifying reciever
    const validReciever = yield (0, utils_1.verifyEmail)(email_reciever);
    if (!validReciever) {
        res.status(400).send({ message: "Invalid Reciever" });
        return;
    }
    else {
        const id = yield (0, uuid_1.v4)();
        const newDescription = `${trans_type} of ${amount} from ${email_sender} to ${email_reciever} with message ${description}`;
        const newTransaction = {
            id,
            trans_type,
            amount,
            description: newDescription,
            email_sender,
            email_reciever
        };
        try {
            yield (0, utils_1.savePendindgTransaction)(newTransaction);
            const sendMoney = yield (0, utils_1.transfer)(newTransaction);
            res.status(200).send(sendMoney);
        }
        catch (error) {
            console.log(error);
            res.status(501).send("Internal Server error");
        }
    }
});
exports.transferRoute = transferRoute;
//withdraw funds
const withdraw = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { bank_acc_name, bank_acc_num, bank, email_sender, amount, trans_type, description } = req.body;
    if (bank == "Access Bank") {
        bank = "044";
    }
    const transId = `${(0, uuid_1.v4)()}9_PMCKDU_1`;
    const withdrawRequest = {
        bank, bank_acc_name, bank_acc_num, email_sender, amount, trans_type, description, transId
    };
    const runVerifyEmail = yield (0, utils_1.verifyEmail)(email_sender);
    const runGetAccountBalance = yield (0, utils_1.getAccountDetails)(email_sender);
    if (!bank || !bank_acc_name || !bank_acc_num || !email_sender || !amount || trans_type !== "Withdrawal" || !description || amount < 1 || runVerifyEmail == false) {
        res.status(400).send({ message: "Bad Request" });
        return;
    }
    else if (runGetAccountBalance.acc_bal < amount) {
        res.status(400).send({ message: "Insufficient Funds", Balance: runGetAccountBalance.acc_bal });
    }
    else {
        const runWithdrawal = yield (0, utils_1.makeWithdrawals)(withdrawRequest);
        res.status(200).send(runWithdrawal);
    }
});
exports.withdraw = withdraw;
//withdraw callback
const withdrawalCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // verify transaction
    const payload = req.body;
    const runVerifyWithdrawal = yield (0, utils_1.verifyWithdrawal)(payload);
    res.status(200).send({ message: runVerifyWithdrawal });
});
exports.withdrawalCallback = withdrawalCallback;
//get all user transaction
const userTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield (0, utils_1.getUserTransactions)(req.params.email);
    res.status(200).send(transactions);
});
exports.userTransactions = userTransactions;
