import mysqlConnection from './config';
import { createLogger } from './utils/logger'
const knex = require('knex')(mysqlConnection)

const logger = createLogger("Database-Tables")
knex.schema.hasTable('users').then(function(exists:boolean) {
  if (!exists) {
    // creating table users
    logger.info('Creating Users table')
    return knex.schema.createTable('users', function(t:any) {
      t.uuid('id').unique()
      t.string('full_name', 255);
      t.double('acc_bal');
      t.string('email',60).unique().primary();
    });
  }
});

knex.schema.hasTable('transactions').then(function(exists:boolean) {
  if (!exists) {
    // creating table transactions
    logger.info('Creating Transactions table')
    return knex.schema.createTable('transactions', function(t:any) {
      t.string('id').primary();
      t.string('trans_type', 25).notNullable();
      t.double('amount').notNullable();
      t.text('description').notNullable();
      t.string('status',25).defaultTo("Pending...").notNullable();
      t.uuid('email_sender').notNullable().references('email').inTable('users').onDelete("RESTRICT");
      t.uuid('email_reciever').nullable().references('email').inTable('users').onDelete("RESTRICT");
      t.timestamp('created_at').defaultTo(knex.fn.now())
      logger.info(`Transactions table ${new Date().toLocaleString()}`)
    });
  }
});


export default knex;