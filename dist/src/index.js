"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
//configuring enviroment Variables
dotenv_1.default.config();
//seting Port using Enviroment Variable
const port = process.env.PORT || 8000;
app_1.default.listen(port, () => {
    console.log(`⚡️[server]: Server is running at ${port}`);
});
//setting up heroku
