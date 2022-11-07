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
exports.verifyWithdrawal = exports.makeWithdrawals = exports.verifyReciever = exports.transfer = exports.cancelledTransaction = exports.VerifyAddMOneyTransaction = exports.savePendindgTransaction = exports.getFundAccountLink = void 0;
const config_1 = require("../../../../config/config");
const fund_1 = __importDefault(require("./fund"));
const dotenv_1 = __importDefault(require("dotenv"));
const withdraw_1 = require("./withdraw");
const logger_1 = require("../../../../utils/logger");
const logger = (0, logger_1.createLogger)("Utils Functions");
dotenv_1.default.config();
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const knex = require('knex')(config_1.mysqlConnection);
//getting the Payment link
const getFundAccountLink = (email, amount, transId, full_name) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Get Fund Account Link");
    const putMoney = yield (0, fund_1.default)(email, amount, transId, full_name);
    return putMoney;
});
exports.getFundAccountLink = getFundAccountLink;
const savePendindgTransaction = (newTransaction) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Saving Pending Transaction");
    knex('transactions').insert(newTransaction)
        .catch((err) => {
        console.log(err);
        throw err;
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
    }).select("id", "amount", "trans_type", "email_sender");
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
            return `transaction ${rows[0].trans_type} ${rows[0].amount} Completed`;
        }
        catch (error) {
            console.log(error);
        }
    }
    else {
        logger.info("Failed Transaction");
        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        const rows = yield knex('transactions').where({
            id: tx_ref
        }).update({
            status: "Failed"
        }, ["id", "trans_type", "amount"]);
        return `transaction ${rows[0].trans_type} ${rows[0].amount} Failed`;
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
    }, ["id"]);
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
        let senderNewBalance = sender[0].acc_bal - amountCharge;
        // save new balance
        const updatedSenderAccountBalance = yield knex('users').where({
            email: transaction.email_sender
        }).update({
            acc_bal: senderNewBalance
        });
    }
    else {
        const rows = yield knex('transactions').where({
            id: transaction.id
        }).update({
            status: "Failed insuficient Funds"
        });
        return "insuficient Funds";
    }
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
    return `transaction ${transaction.id}  Completed`;
});
exports.transfer = transfer;
const verifyReciever = (email) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.verifyReciever = verifyReciever;
const makeWithdrawals = (withdrawal) => __awaiter(void 0, void 0, void 0, function* () {
    const { bank, bank_acc_name, bank_acc_num } = withdrawal;
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
    let email = rows[0].email_sender;
    if (withdrawMoney.status === "success" &&
        withdrawMoney.data.amount === expectedAmount &&
        withdrawMoney.data.currency === "NGN" && withdrawMoney.data.account_number) {
        // Success! Confirm the customer's payment
        try {
            // update transaction from pending to Queued
            const updatedId = yield knex('transactions').where({
                id: withdrawal.transId
            }).update({
                status: "Queued"
            });
            return `transaction ${rows[0].trans_type} ${rows[0].amount}, ${rows[0].description} Queued`;
        }
        catch (error) {
            console.log(error);
        }
    }
    else {
        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        const setFailed = yield knex('transactions').where({
            id: withdrawal.transId
        }).update({
            status: "Failed"
        });
        return `transaction ${rows[0].trans_type} ${rows[0].amount}, ${rows[0].description} Failed`;
    }
});
exports.makeWithdrawals = makeWithdrawals;
const verifyWithdrawal = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield knex.from('transactions').where({
        id: payload.reference
    }).select("id", "amount", "trans_type", "email_sender", "description");
    let expectedAmount = rows[0].amount;
    let email = rows[0].email_sender;
    if (payload.data.status === "SUCCESSFUL" &&
        payload.data.amount === expectedAmount &&
        payload.data.currency === "NGN") {
        // Success! Confirm the customer's payment
        try {
            // update transaction from Queued to Completed
            const updatedId = yield knex('transactions').where({
                id: payload.reference
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
            return `transaction ${rows[0].trans_type} ${rows[0].amount}, ${rows[0].description} Completed`;
        }
        catch (error) {
            console.log(error);
        }
    }
    else {
        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        const setFailed = yield knex('transactions').where({
            id: payload.reference
        }).update({
            status: "Failed"
        });
        return `transaction ${rows[0].trans_type} ${rows[0].amount}, ${rows[0].description} Failed`;
    }
});
exports.verifyWithdrawal = verifyWithdrawal;
