import express, { Express,Request,Response,NextFunction} from 'express';
import knex from './knex';
import {IndexRouter} from './controllers/v0/indexRouter'
import bodyParser from'body-parser';
import cors from 'cors';
var morgan = require('morgan');
var compression = require('compression');
import helmet from "helmet";

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


app.use(helmet())


app.use(express.json());

//compression middleware
app.use(compression())
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

//morgan for loging connection
app.use(morgan('combined'))

//error handling
app.use((err:any,req:Request,res:Response,next:NextFunction)=>{
    console.log(err);
    console.error(err.stack)
    res.status(500).send({error:'Internal Server Error!'})
    
})

//seting up our routes
app.use('/api/v0/', IndexRouter);

// custom 404
app.use((req:Request,res:Response,next:NextFunction) => {
    res.status(404).send({error:"Not found!"})
  })
  


export default app;