import {
    Router,
    Request,
    Response
} from 'express';
import {
    v4 as uuid
} from 'uuid';
import {mysqlConnection} from '../../../../config/config';
const Flutterwave = require('flutterwave-node-v3');
import dotenv from 'dotenv';
import { cancelledTransaction, getFundAccountLink, makeWithdrawals, savePendindgTransaction, transfer, verifyReciever, VerifyAddMOneyTransaction, verifyWithdrawal } from './utils';
import { verify } from 'crypto';

// setting up envroment variable
dotenv.config();
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

const router: Router = Router();
const knex = require('knex')(mysqlConnection);

router.post('/add-money', async (req: Request, res: Response) => {
    const {
        amount,
        description,
        trans_type,
        email,
        full_name
    } = req.body;

    console.log(email);

    const id = await uuid();

    const newTransaction = {
        id,
        email_sender:email,
        trans_type,
        amount,
        description,
    }
    try {
        const saved = await savePendindgTransaction(newTransaction);    
        const linkJson = await getFundAccountLink(email, amount, id, full_name);
        const result = {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true
            },
            body: linkJson
          }
          res.send(result);
        linkJson;            
    } catch (error:any) {
        console.log(error);
        
        const result = {
            statusCode: 501,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true
            },
            body: `Internal Server Error ${error.message}`
          }
          res.send(result);
    }
})

router.get('/fund-account-callback', async (req:Request, res:Response) => {
    // verify transaction
    let status = req.query.status;

    //cancelled transaction
    if (status == "cancelled") {
        const updateCancelledTransaction =await cancelledTransaction(req.query.tx_ref)
        const result = {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true
            },
            body: {
              items: updateCancelledTransaction
            }
          }
          res.send(result);
          return
    }
    const runVerify = await VerifyAddMOneyTransaction(req.query.tx_ref,req.query.transaction_id)
    const result = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: {
          items: runVerify
        }
      }
      res.send(result);
});


router.post('/transfer', async (req: Request, res: Response) => {
    const {
        amount,
        description,
        trans_type,
        email_sender,
        email_reciever,
    } = req.body;


    //verifying reciever
    const validReciever = await verifyReciever(email_reciever);
    if (!validReciever) {
        const result = {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true
            },
            body: 'Invalid Reciever Check Email Please'
          }
          res.send(result);
          return
    } else{
    
        const id = await uuid();

    const newTransaction = {
        id,
        trans_type,
        amount,
        description,
        email_sender,
        email_reciever
    }
    try {
        
        const saved = await savePendindgTransaction(newTransaction);
        const sendMoney = await transfer(newTransaction);    
        const result = {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true
            },
            body: sendMoney
          }
          res.send(result);
    } catch (error:any) {
        console.log(error);
        
        const result = {
            statusCode: 501,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true
            },
            body: `Internal Server Error ${error.message}`
          }
          res.send(result);
    }
    }
    
})

router.post('/withdraw',async(req:Request,res:Response)=>{
    let {bank_acc_name,bank_acc_num,bank,email_sender,amount,trans_type,description} =req.body;
    if (bank =="Access Bank") {
        bank = "044";
    }
    const transId = `${uuid()}9_PMCKDU_1`
    const withdrawRequest ={
        bank,bank_acc_name,bank_acc_num,email_sender,amount,trans_type,description,transId
    }
    const runWithdrawal = await makeWithdrawals(withdrawRequest); 

    const result = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: {
            items:runWithdrawal
        }
      }
      res.send(result);
})

router.get('/withdrawal-callback', async (req:Request, res:Response) => {
    // verify transaction
    const payload = req.body;
    const runVerifyWithdrawal = await verifyWithdrawal(payload);
    const result = {
        statusCode: 501,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: {
            items:runVerifyWithdrawal
        }
      }
      res.send(result) 
});


export const TranRouter: Router = router;