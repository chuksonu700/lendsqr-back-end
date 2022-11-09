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
exports.getAccountDetails = void 0;
const config_1 = __importDefault(require("../../../config"));
const logger_1 = require("../../../utils/logger");
const knex = require('knex')(config_1.default);
const logger = (0, logger_1.createLogger)("Utils Functions");
const getAccountDetails = (email) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Get Account Balance");
    const rows = yield knex.from('users').where({ email: email }).select("id", "email", "acc_bal", "full_name");
    return rows;
});
exports.getAccountDetails = getAccountDetails;
