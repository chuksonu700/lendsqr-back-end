"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranRouter = void 0;
const express_1 = require("express");
const handler_1 = require("./handler");
const router = (0, express_1.Router)();
router.post('/add-money', handler_1.addMoney);
router.get('/fund-account-callback', handler_1.fundAccountCallback);
router.post('/transfer', handler_1.transferRoute);
router.post('/withdraw', handler_1.withdraw);
router.get('/withdrawal-callback', handler_1.withdrawalCallback);
router.get('/:email', handler_1.userTransactions);
exports.TranRouter = router;
