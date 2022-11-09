"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.getUserTransactions = exports.verifyWithdrawal = exports.makeWithdrawals = exports.transfer = exports.cancelledTransaction = exports.VerifyAddMOneyTransaction = exports.savePendindgTransaction = exports.addMoneyLink = void 0;
const config_1 = __importStar(require("../../../config"));
const addMoney_1 = __importDefault(require("../transactions/addMoney"));
const withdraw_1 = require("../transactions/withdraw");
const logger_1 = require("../../../utils/logger");
const users_1 = require("../dataAccess/users");
const transactions_1 = require("../dataAccess/transactions");
const logger = (0, logger_1.createLogger)("Utils Functions");
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(config_1.ENV.FLW_PUBLIC_KEY, config_1.ENV.FLW_SECRET_KEY);
const knex = require('knex')(config_1.default);
//getting the Payment link
const addMoneyLink = (email, amount, transId, full_name) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Get Fund Account Link");
    const putMoney = yield (0, addMoney_1.default)(amount, transId, full_name);
    return putMoney;
});
exports.addMoneyLink = addMoneyLink;
const savePendindgTransaction = (newTransaction) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Saving Pending Transaction");
    knex('transactions').insert(newTransaction)
        .catch((err) => {
        console.log(err);
        return false;
    })
        .finally(() => {
        return 'Transaction Inserted';
    });
});
exports.savePendindgTransaction = savePendindgTransaction;
const VerifyAddMOneyTransaction = (tx_ref, transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Verifing Add Money Transaction");
    const rows = yield knex.from('transactions').where({
        id: tx_ref
    }).select("id", "amount", "trans_type", "email_sender", "description");
    let expectedAmount = rows[0].amount;
    let email = rows[0].email_sender;
    logger.info("Flutterwave Verify Transaction");
    const response = yield flw.Transaction.verify({
        id: transactionId
    });
    if (response.data.status === "successful" &&
        response.data.amount === expectedAmount &&
        response.data.currency === "NGN") {
        // Success! Confirm the customer's payment
        try {
            logger.info("Successful Transaction");
            // update transaction from pending to Completed
            const updatedId = yield knex('transactions').where({
                id: tx_ref
            }).update({
                status: "Completed"
            }, ["id"]);
            // update Account Balance
            const getAccountBalance = yield knex.from('users').select("id", "acc_bal").where({
                email: email
            });
            // compute new balance
            const new_Acc_Bal = getAccountBalance[0].acc_bal + response.data.amount;
            // save new balance
            const updatedAccountBalance = yield knex('users').where({
                email: email
            }).update({
                acc_bal: new_Acc_Bal
            }, ["id"]);
            return `Completed`;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    else {
        logger.info("Failed Transaction");
        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        const updateTransactionTOFailled = yield knex('transactions').where({
            id: tx_ref
        }).update({
            status: "Failed"
        });
        return `Failed`;
    }
});
exports.VerifyAddMOneyTransaction = VerifyAddMOneyTransaction;
const cancelledTransaction = (tx_ref) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Cancelled Add Money Transaction");
    // update transaction from pending to Cancelled
    const rows = yield knex('transactions').where({
        id: tx_ref
    }).update({
        status: "Cancelled"
    });
    return `transaction ${tx_ref}  Cancelled`;
});
exports.cancelledTransaction = cancelledTransaction;
const transfer = (transaction, amountCharge) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Transfer Money");
    const sender = yield (0, users_1.getAccountDetails)(transaction.email_sender);
    let senderNewBalance = sender[0].acc_bal - amountCharge;
    // save new balance ofsender
    yield (0, users_1.updateUserAccBal)(transaction.email_sender, senderNewBalance);
    logger.info("Updating Reciever");
    const reciever = yield (0, users_1.getAccountDetails)(transaction.email_reciever);
    let recieverNewBalance = reciever[0].acc_bal + transaction.amount;
    // save new Reciever balance
    yield (0, users_1.updateUserAccBal)(transaction.email_reciever, recieverNewBalance);
    //update transaction status
    yield (0, transactions_1.updateTransactionStatus)(transaction.id, "Completed");
    return {
        message: `Completed ${transaction.description}`,
        status: "Success"
    };
});
exports.transfer = transfer;
const makeWithdrawals = (withdrawal) => __awaiter(void 0, void 0, void 0, function* () {
    const { bank_acc_name, bank_acc_num, email_sender, amount, transId, trans_type, } = withdrawal;
    logger.info("Make Withdrawal");
    let newDescription = `Withdrawal to ${bank_acc_name} ${bank_acc_num} ${withdrawal.description}`;
    const newTransaction = {
        email_sender,
        amount,
        trans_type,
        id: transId,
        description: newDescription
    };
    //saving pendng Trasaction
    yield (0, exports.savePendindgTransaction)(newTransaction);
    const withdrawMoney = yield (0, withdraw_1.runWithdrawal)(withdrawal);
    //verify transaction
    if (withdrawMoney.status === "success" && withdrawMoney.message == "Transfer Queued Successfully" &&
        withdrawMoney.data.amount === amount &&
        withdrawMoney.data.currency === "NGN" && withdrawMoney.data.account_number == bank_acc_num) {
        // Success! Confirm the customer's payment
        try {
            logger.info("Withdraw Transaction Queued");
            // update transaction from pending to Queued
            //update transaction status
            yield (0, transactions_1.updateTransactionStatus)(withdrawal.transId, "Queued");
            //verify transaction
            runIn2Mins(withdrawMoney.data.id);
            return withdrawMoney;
        }
        catch (error) {
            console.log(error);
            return { message: "An Error Occured" };
        }
    }
    else {
        logger.info("Withdraw Transaction Failed");
        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        yield (0, transactions_1.updateTransactionStatus)(withdrawal.transId, "Failed");
        return withdrawMoney;
    }
});
exports.makeWithdrawals = makeWithdrawals;
const verifyWithdrawal = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Verify Withdrawal Transaction ");
    //get Transaction details from DB
    const rows = yield (0, transactions_1.getTransaction)(payload.data.reference);
    let expectedAmount = rows[0].amount;
    let email = rows[0].email_sender;
    if (rows[0].status == "Failed" || rows[0].status == "Completed") {
        //transaction Already Failed or Completed
        console.log("Already Updated");
        return { message: "Transaction Already Updated" };
    }
    if (payload.data.status === "SUCCESSFUL" &&
        payload.data.amount === expectedAmount &&
        payload.data.currency === "NGN") {
        // Success! Confirm the customer's payment
        try {
            logger.info("Withdraw Transaction Successfull");
            // update transaction from Queued to Completed
            yield (0, transactions_1.updateTransactionStatus)(payload.reference, "Completed");
            // update Account Balance
            const getAccountBalance = yield (0, users_1.getAccountDetails)(email);
            // compute new balance
            const new_Acc_Bal = Math.floor(getAccountBalance[0].acc_bal - payload.data.amount - payload.data.fee);
            // save new balance
            yield (0, users_1.updateUserAccBal)(email, new_Acc_Bal);
            return { message: "Transaction Completed" };
        }
        catch (error) {
            console.log(error);
            return { message: "An error Occured" };
        }
    }
    else {
        logger.info("Withdraw Transaction Failed");
        //update transaction from Queued to Failed
        yield (0, transactions_1.updateTransactionStatus)(payload.reference, "Failed");
        return { message: "Transaction Failed" };
    }
});
exports.verifyWithdrawal = verifyWithdrawal;
const getUserTransactions = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield knex.from('transactions').where({
        email_sender: email
    }).orWhere({
        email_reciever: email
    }).select("*");
    return rows;
});
exports.getUserTransactions = getUserTransactions;
// runs a function to verify withdrawal status every 10 mins
const runIn2Mins = (id) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Will verify Withdrawal in 2 Mins");
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        const checkStatus = yield (0, withdraw_1.withdrawalStatus)(id);
        (0, exports.verifyWithdrawal)(checkStatus);
    }), 90000);
});
