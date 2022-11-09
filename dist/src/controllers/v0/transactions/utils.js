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
exports.getUserTransactions = exports.verifyWithdrawal = exports.makeWithdrawals = exports.verifyEmail = exports.transfer = exports.cancelledTransaction = exports.VerifyAddMOneyTransaction = exports.savePendindgTransaction = exports.getFundAccountLink = void 0;
const config_1 = __importStar(require("../../../config"));
const fund_1 = __importDefault(require("./fund"));
const withdraw_1 = require("./withdraw");
const logger_1 = require("../../../utils/logger");
const logger = (0, logger_1.createLogger)("Utils Functions");
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(config_1.ENV.FLW_PUBLIC_KEY, config_1.ENV.FLW_SECRET_KEY);
const knex = require('knex')(config_1.default);
//getting the Payment link
const getFundAccountLink = (email, amount, transId, full_name) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Get Fund Account Link");
    const putMoney = yield (0, fund_1.default)(amount, transId, full_name);
    return putMoney;
});
exports.getFundAccountLink = getFundAccountLink;
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
    const response = yield flw.Transaction.verify({ id: transactionId });
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
const transfer = (transaction) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Transfer Money");
    let charge = Math.ceil(transaction.amount * 0.01);
    let amountCharge = transaction.amount + charge;
    // check account balance of sender
    logger.info("Check account balance of sender");
    const sender = yield knex.from('users').where({
        email: transaction.email_sender
    }).select("id", "acc_bal");
    if (sender[0].acc_bal > amountCharge) {
        logger.info("Successful Transfer");
        let senderNewBalance = sender[0].acc_bal - amountCharge;
        // save new balance
        const updatedSenderAccountBalance = yield knex('users').where({
            email: transaction.email_sender
        }).update({
            acc_bal: senderNewBalance
        });
        logger.info("Updating Reciever");
        const reciever = yield knex.from('users').where({
            email: transaction.email_reciever
        }).select("id", "acc_bal");
        let recieverNewBalance = reciever[0].acc_bal + transaction.amount;
        // save new balance
        const updatedRecieverAccountBalance = yield knex('users').where({
            email: transaction.email_reciever
        }).update({
            acc_bal: recieverNewBalance
        });
        const rows = yield knex('transactions').where({
            id: transaction.id
        }).update({
            status: "Completed"
        });
        return { message: `Completed ${transaction.description}`, status: "Success" };
    }
    else {
        logger.info("Insuffienct Funds");
        const rows = yield knex('transactions').where({
            id: transaction.id
        }).update({
            status: "Failed insuficient Funds"
        });
        return { message: `insuficient Funds`, status: "Failed" };
    }
});
exports.transfer = transfer;
const verifyEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("verify Reciever's Email");
    const rows = yield knex.from('users').where({
        email: email
    }).select("id", "email");
    if (rows.length < 1) {
        return false;
    }
    else {
        return true;
    }
});
exports.verifyEmail = verifyEmail;
const makeWithdrawals = (withdrawal) => __awaiter(void 0, void 0, void 0, function* () {
    const { bank, bank_acc_name, bank_acc_num, email_sender, amount, trans_type, } = withdrawal;
    logger.info("Make Withdrawal");
    let newDescription = `Withdrawal to ${bank_acc_name} ${bank_acc_num} ${withdrawal.description}`;
    const newTransaction = {
        email_sender: withdrawal.email_sender,
        amount: withdrawal.amount,
        trans_type: withdrawal.trans_type,
        id: withdrawal.transId,
        description: newDescription
    };
    //saving pendng Trasaction
    yield (0, exports.savePendindgTransaction)(newTransaction);
    const withdrawMoney = yield (0, withdraw_1.runWithdrawal)(withdrawal);
    //verify transaction
    const rows = yield knex.from('transactions').where({
        id: withdrawal.transId
    }).select("id", "amount", "trans_type", "email_sender", "description");
    let expectedAmount = rows[0].amount;
    if (withdrawMoney.status === "success" &&
        withdrawMoney.data.amount === expectedAmount &&
        withdrawMoney.data.currency === "NGN" && withdrawMoney.data.account_number) {
        // Success! Confirm the customer's payment
        try {
            logger.info("Withdraw Transaction Queued");
            // update transaction from pending to Queued
            const updatedId = yield knex('transactions').where({
                id: withdrawal.transId
            }).update({
                status: "Queued"
            });
            runIn2Mins(withdrawMoney.data.id);
            return withdrawMoney;
        }
        catch (error) {
            console.log(error);
        }
    }
    else {
        logger.info("Withdraw Transaction Failed");
        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        const setFailed = yield knex('transactions').where({
            id: withdrawal.transId
        }).update({
            status: "Failed"
        });
        return withdrawMoney;
    }
});
exports.makeWithdrawals = makeWithdrawals;
const verifyWithdrawal = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Verify Withdrawal Transaction ");
    //get Transaction details from DB
    const rows = yield knex.from('transactions').where({
        id: payload.data.reference
    }).select("id", "amount", "trans_type", "email_sender", "description", "status");
    let expectedAmount = rows[0].amount;
    let email = rows[0].email_sender;
    if (rows[0].status == "Failed" || rows[0].status == "Completed") {
        //transaction Already Failed or Completed
        console.log("Already Updated");
        return "Transaction Already Updated";
    }
    if (payload.data.status === "SUCCESSFUL" &&
        payload.data.amount === expectedAmount &&
        payload.data.currency === "NGN") {
        // Success! Confirm the customer's payment
        try {
            logger.info("Withdraw Transaction Successfull");
            // update transaction from Queued to Completed
            const updatedId = yield knex('transactions').where({
                id: payload.data.reference
            }).update({
                status: "Completed"
            });
            // update Account Balance
            const getAccountBalance = yield knex.from('users').select("id", "acc_bal").where({
                email: email
            });
            // compute new balance
            const new_Acc_Bal = Math.floor(getAccountBalance[0].acc_bal - payload.data.amount - payload.data.fee);
            // save new balance
            const updatedAccountBalance = yield knex('users').where({
                email: email
            }).update({
                acc_bal: new_Acc_Bal
            });
            return "Saved Completed";
        }
        catch (error) {
            console.log(error);
            return "501 error";
        }
    }
    else {
        logger.info("Withdraw Transaction Failed");
        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        const setFailed = yield knex('transactions').where({
            id: payload.reference
        }).update({
            status: "Failed"
        });
        return "saved Failed";
    }
});
exports.verifyWithdrawal = verifyWithdrawal;
const getUserTransactions = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield knex.from('transactions').where({ email_sender: email }).orWhere({ email_reciever: email }).select("*");
    return rows;
});
exports.getUserTransactions = getUserTransactions;
// runs a function to verify withdrawal status every 10 mins
const runIn2Mins = (id) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Will verify Withdrawal in 2 Mins");
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        const checkStatus = yield (0, withdraw_1.withdrawalStatus)(id);
        console.log(checkStatus);
        (0, exports.verifyWithdrawal)(checkStatus);
    }), 90000);
});
