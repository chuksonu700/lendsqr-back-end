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
exports.TranRouter = void 0;
const express_1 = require("express");
const uuid_1 = require("uuid");
const config_1 = require("../../../../config/config");
const Flutterwave = require('flutterwave-node-v3');
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("./utils");
// setting up envroment variable
dotenv_1.default.config();
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const router = (0, express_1.Router)();
const knex = require('knex')(config_1.mysqlConnection);
router.post('/add-money', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, description, trans_type, email, full_name } = req.body;
    console.log(email);
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
        const result = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: linkJson
        };
        res.send(result);
        linkJson;
    }
    catch (error) {
        console.log(error);
        const result = {
            statusCode: 501,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: `Internal Server Error ${error.message}`
        };
        res.send(result);
    }
}));
router.get('/fund-account-callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // verify transaction
    let status = req.query.status;
    //cancelled transaction
    if (status == "cancelled") {
        const updateCancelledTransaction = yield (0, utils_1.cancelledTransaction)(req.query.tx_ref);
        const result = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: {
                items: updateCancelledTransaction
            }
        };
        res.send(result);
        return;
    }
    const runVerify = yield (0, utils_1.VerifyAddMOneyTransaction)(req.query.tx_ref, req.query.transaction_id);
    const result = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: {
            items: runVerify
        }
    };
    res.send(result);
}));
router.post('/transfer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, description, trans_type, email_sender, email_reciever, } = req.body;
    //verifying reciever
    const validReciever = yield (0, utils_1.verifyReciever)(email_reciever);
    if (!validReciever) {
        const result = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: 'Invalid Reciever Check Email Please'
        };
        res.send(result);
        return;
    }
    else {
        const id = yield (0, uuid_1.v4)();
        const newTransaction = {
            id,
            trans_type,
            amount,
            description,
            email_sender,
            email_reciever
        };
        try {
            const saved = yield (0, utils_1.savePendindgTransaction)(newTransaction);
            const sendMoney = yield (0, utils_1.transfer)(newTransaction);
            const result = {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: sendMoney
            };
            res.send(result);
        }
        catch (error) {
            console.log(error);
            const result = {
                statusCode: 501,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: `Internal Server Error ${error.message}`
            };
            res.send(result);
        }
    }
}));
router.post('/withdraw', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { bank_acc_name, bank_acc_num, bank, email_sender, amount, trans_type, description } = req.body;
    if (bank == "Access Bank") {
        bank = "044";
    }
    const transId = `${(0, uuid_1.v4)()}9_PMCKDU_1`;
    const withdrawRequest = {
        bank, bank_acc_name, bank_acc_num, email_sender, amount, trans_type, description, transId
    };
    const runWithdrawal = yield (0, utils_1.makeWithdrawals)(withdrawRequest);
    const result = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: {
            items: runWithdrawal
        }
    };
    res.send(result);
}));
router.get('/withdrawal-callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // verify transaction
    const payload = req.body;
    const runVerifyWithdrawal = yield (0, utils_1.verifyWithdrawal)(payload);
    const result = {
        statusCode: 501,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: {
            items: runVerifyWithdrawal
        }
    };
    res.send(result);
}));
exports.TranRouter = router;
