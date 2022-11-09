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
const got = require("got");
const config_1 = require("../../../config");
const logger_1 = require("../../../utils/logger");
const logger = (0, logger_1.createLogger)("Fund Account");
const addMoney = (amount, transId, full_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info("Generating Fund Link");
        const response = yield got.post("https://api.flutterwave.com/v3/payments", {
            headers: {
                Authorization: `Bearer ${config_1.ENV.FLW_SECRET_KEY}`
            },
            json: {
                tx_ref: transId,
                amount,
                currency: "NGN",
                redirect_url: `http://localhost:8000/api/v0/transaction/fund-account-callback`,
                customer: {
                    email: config_1.ENV.PAYMENT_EMAIL,
                },
                customizations: {
                    title: "Demo Credit Add Funds",
                    logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
                },
                payment_options: "card, ussd, banktransfer,account"
            }
        }).json();
        return response;
    }
    catch (err) {
        console.log("err.code", err.code);
        console.log("err.response.body", err.response.body);
    }
});
exports.default = addMoney;
