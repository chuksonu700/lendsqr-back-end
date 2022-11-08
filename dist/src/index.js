"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
//seting Port using Enviroment Variable
const port = config_1.ENV.port || 8000;
app_1.default.listen(port, () => {
    console.log(`⚡️[server]: Server is running at ${port}`);
});
//setting up heroku
