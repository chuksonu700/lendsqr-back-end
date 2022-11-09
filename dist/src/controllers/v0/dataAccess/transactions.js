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
exports.getUserTransactions = exports.savePendindgTransaction = exports.updateTransactionStatus = exports.getTransaction = exports.AddCharge = void 0;
const config_1 = __importDefault(require("../../../config"));
const knex = require('knex')(config_1.default);
const AddCharge = (amount) => {
    let newAmount = Math.ceil(amount * 0.01) + amount;
    return newAmount;
};
exports.AddCharge = AddCharge;
const getTransaction = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield knex.from('transactions').where({
        id: transactionId
    }).select("id", "amount", "trans_type", "email_sender", "description", "status")
        .catch((err) => {
        console.log(err);
        return { message: `An error Occured` };
    });
    return transaction;
});
exports.getTransaction = getTransaction;
const updateTransactionStatus = (transactionId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const updateTransaction = yield knex('transactions').where({
        id: transactionId
    }).update({
        status: status
    }).catch((err) => {
        console.log(err);
        return { message: `An error Occured` };
    });
    return updateTransaction;
});
exports.updateTransactionStatus = updateTransactionStatus;
const savePendindgTransaction = (newTransaction) => __awaiter(void 0, void 0, void 0, function* () {
    knex('transactions').insert(newTransaction)
        .catch((err) => {
        console.log(err);
        return { message: `An error Occured` };
    })
        .finally(() => {
        return { message: 'Pending Transaction Inserted' };
    });
});
exports.savePendindgTransaction = savePendindgTransaction;
const getUserTransactions = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const userTransaction = yield knex.from('transactions').where({
        email_sender: email
    }).orWhere({
        email_reciever: email
    }).select("*")
        .catch((err) => {
        console.log(err);
        return { message: `An error Occured` };
    });
    return userTransaction;
});
exports.getUserTransactions = getUserTransactions;
