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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const uuid_1 = require("uuid");
const config_1 = require("../../../../config/config");
const logger_1 = require("../../../../utils/logger");
const router = (0, express_1.Router)();
const knex = require('knex')(config_1.mysqlConnection);
const logger = (0, logger_1.createLogger)("User Router");
//get a user details from email 
router.get('/:email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info('Getting single User details');
    const rows = yield knex.from('users').where({ email: req.params.email }).select("id", "email", "acc_bal", "full_name");
    res.send(rows[0]);
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info('Saving a new User');
    //gettting the email and full_name from req.bodys
    const { email, full_name } = req.body;
    // creating new user object 
    const newUser = {
        id: (0, uuid_1.v4)(),
        email,
        full_name,
        acc_bal: 0.00
    };
    //call database to check if email already exists
    logger.info('Checking if user already exist');
    const rows = yield knex.from('users').where({ email: email }).select("id", "email");
    if (rows.length < 1) {
        logger.info('Saving a new User');
        //save new user
        knex('users').insert(newUser)
            .catch((err) => {
            console.log(err);
        })
            .finally(() => {
            const result = {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: {
                    items: newUser
                }
            };
            res.send(result);
        });
    }
    else {
        //Const User already Exist.
        logger.info('User Already Exist');
        const result = {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: 'user Already Exist'
        };
        res.send(result);
    }
}));
exports.UserRouter = router;
