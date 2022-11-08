"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const knex_1 = __importDefault(require("./knex"));
const indexRouter_1 = require("./controllers/v0/indexRouter");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
var morgan = require('morgan');
//connecting the database
knex_1.default.raw("SELECT VERSION()").then((version) => console.log((version[0][0]))).catch((err) => { console.log(err); throw err; })
    .finally(() => {
    console.log("MySql Database Connected");
    knex_1.default.destroy();
});
//setting up express
const app = (0, express_1.default)();
//middlewares body-parser 
app.use(body_parser_1.default.json());
//Cross oringing Resources Sharing
app.use((0, cors_1.default)({
    allowedHeaders: [
        'Origin', 'X-Requested-With',
        'Content-Type', 'Accept',
        'X-Access-Token', 'Authorization',
    ],
    methods: 'GET,POST',
    preflightContinue: true,
    origin: '*',
}));
//morgan for loging
app.use(morgan('combined'));
//seting up our routes
app.use('/api/v0/', indexRouter_1.IndexRouter);
exports.default = app;
