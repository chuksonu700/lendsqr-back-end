"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const knex_1 = __importDefault(require("./knex"));
dotenv_1.default.config();
knex_1.default.raw("SELECT VERSION()").then((version) => console.log((version[0][0]))).catch((err) => { console.log(err); throw err; })
    .finally(() => {
    knex_1.default.destroy();
});
const app = (0, express_1.default)();
const port = process.env.PORT;
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server Thanks');
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
