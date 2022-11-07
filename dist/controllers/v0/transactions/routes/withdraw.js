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
exports.runWithdrawal = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../../../../utils/logger");
const logger = (0, logger_1.createLogger)("Withdrawal");
dotenv_1.default.config();
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
//Run Withdrawal
const runWithdrawal = (withdrawRequest) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Executing Withdrawal");
    //detials for the Transaction
    const details = {
        account_bank: withdrawRequest.bank,
        account_number: withdrawRequest.bank_acc_num,
        amount: withdrawRequest.amount,
        narration: "Payment for things",
        currency: "NGN",
        reference: withdrawRequest.transId,
        callback_url: "http://localhost:8000/api/v0/transaction/withdrawal-callbacK",
        debit_currency: "NGN"
    };
    const queueWithdrawal = yield flw.Transfer.initiate(details);
    logger.info("Withdrawal Completed");
    return queueWithdrawal;
});
exports.runWithdrawal = runWithdrawal;
