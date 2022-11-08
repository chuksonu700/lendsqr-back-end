import express, { Express} from 'express';
import knex from './knex';
import {IndexRouter} from './controllers/v0/indexRouter'
import bodyParser from'body-parser';
import cors from 'cors';
var morgan = require('morgan')

//connecting the database
knex.raw("SELECT VERSION()").then(
  (version: any[][]) => console.log((version[0][0]))
).catch((err: any) => { console.log( err); throw err })
  .finally(() => {
      console.log("MySql Database Connected")
      knex.destroy();
});

//setting up express
const app: Express = express();

//middlewares body-parser 
app.use(bodyParser.json());

//Cross oringing Resources Sharing
app.use(cors({
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
app.use(morgan('combined'))
 
//seting up our routes
app.use('/api/v0/', IndexRouter);

export default app;