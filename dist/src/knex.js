"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config/config"));
const logger_1 = require("./utils/logger");
const knex = require('knex')(config_1.default);
const logger = (0, logger_1.createLogger)("Database-Tables");
knex.schema.hasTable('users').then(function (exists) {
    if (!exists) {
        // creating table users
        logger.info('Creating Users table');
        return knex.schema.createTable('users', function (t) {
            t.string('full_name', 255);
            t.double('acc_bal');
            t.string('email', 60).unique().primary();
        });
    }
});
knex.schema.hasTable('transactions').then(function (exists) {
    if (!exists) {
        // creating table transactions
        logger.info('Creating Transactions table');
        return knex.schema.createTable('transactions', function (t) {
            t.string('id').primary();
            t.string('trans_type', 25);
            t.double('amount');
            t.text('description');
            t.string('status', 25).defaultTo("Pending...");
            t.uuid('email_sender').notNullable().references('email').inTable('users').onDelete("RESTRICT");
            t.uuid('email_reciever').nullable().references('email').inTable('users').onDelete("RESTRICT");
            t.timestamp('created_at').defaultTo(knex.fn.now());
            logger.info(`Transactions table ${new Date().toLocaleString()}`);
        });
    }
});
exports.default = knex;
