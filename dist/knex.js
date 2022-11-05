"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config/config");
const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: config_1.config.host,
        port: config_1.config.port,
        user: config_1.config.username,
        password: config_1.config.password,
        database: config_1.config.name
    }
});
exports.default = knex;
