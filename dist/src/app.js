"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const knex_1 = __importDefault(require("./knex"));
const indexRouter_1 = require("./controllers/v0/indexRouter");
const cors_1 = __importDefault(require("cors"));
var morgan = require('morgan');
var compression = require('compression');
const helmet_1 = __importDefault(require("helmet"));
//connecting the database
knex_1.default.raw("SELECT VERSION()").then((version) => console.log((version[0][0]))).catch((err) => { console.log(err); throw err; })
    .finally(() => {
    console.log("MySql Database Connected");
    knex_1.default.destroy();
});
//setting up express
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true
}));
//compression middleware
app.use(compression());
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
//morgan for loging connection
app.use(morgan('combined'));
//error handling
app.use((err, req, res, next) => {
    console.log(err);
    console.error(err.stack);
    res.status(500).send({ error: 'Internal Server Error!' });
});
//seting up our routes
app.use('/api/v0/', indexRouter_1.IndexRouter);
app.get('/', (req, res) => {
    res.status(200).send('/api/v0/');
});
// custom 404
app.use((req, res, next) => {
    res.status(404).send({ error: "Not found!" });
});
exports.default = app;
