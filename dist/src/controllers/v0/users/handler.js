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
exports.createNewUser = exports.getUserDetails = void 0;
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../../../config"));
const logger_1 = require("../../../utils/logger");
const users_1 = require("../dataAccess/users");
const knex = require('knex')(config_1.default);
const logger = (0, logger_1.createLogger)("User Router");
//get a user details from email 
const getUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info('Getting single User details');
    const userDetails = yield (0, users_1.getAccountDetails)(req.params.email);
    if (userDetails.length > 0) {
        logger.info("User Found");
        res.status(200).send(userDetails);
    }
    else {
        logger.info("No User Found");
        res.status(200).json({
            message: 'No User Found'
        });
    }
});
exports.getUserDetails = getUserDetails;
// Create a new user Account
const createNewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info('Saving a new User');
    //gettting the email and full_name from req.bodys
    const { email, full_name } = req.body;
    if (!email || !full_name) {
        res.status(400).send({ message: "Bad Request" });
        return;
    }
    // creating new user object 
    const newUser = {
        id: (0, uuid_1.v4)(),
        email,
        full_name,
        acc_bal: 0.00
    };
    //call database to check if email already exists
    logger.info('Checking if user already exist');
    const userDetails = yield (0, users_1.getAccountDetails)(email);
    if (userDetails.length < 1) {
        logger.info('Saving a new User');
        //save new user
        const saved = yield (0, users_1.saveNewUser)(newUser);
        if (saved) {
            res.status(201).send(newUser);
        }
        else {
            res.status(501).send({
                message: "An Error Occured"
            });
        }
    }
    else {
        // User already Exist.
        logger.info('User Already Exist');
        res.status(201).json({
            message: 'User Already Exist'
        });
    }
});
exports.createNewUser = createNewUser;
