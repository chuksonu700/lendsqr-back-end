"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const handler_1 = require("./handler");
const router = (0, express_1.Router)();
//get a user details from email 
router.get('/:email', handler_1.getUserDetails);
//Create Account
router.post('/create-account', handler_1.createNewUser);
exports.UserRouter = router;
