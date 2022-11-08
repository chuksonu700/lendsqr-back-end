import {
    Request,
    Response
} from 'express';

import {
    v4 as uuid
} from 'uuid';
import mysqlConnection from '../../../../config/config';
const Flutterwave = require('flutterwave-node-v3');
import dotenv from 'dotenv';
import { cancelledTransaction, getFundAccountLink, makeWithdrawals, savePendindgTransaction, transfer, verifyReciever, VerifyAddMOneyTransaction, verifyWithdrawal,getUserTransactions } from './utils';

// setting up envroment variable
dotenv.config();
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

const knex = require('knex')(mysqlConnection);

export const addMoney = async (req: Request, res: Response) => {
    const {
        amount,
        description,
        trans_type,
        email,
        full_name
    } = req.body;

    if (!amount || amount < 1|| !description || trans_type !== "Add-Money" || !email || !full_name) {
      //incomplete Details
      res.status(400).send({error:"Bad Request"});
    } else {

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
        res.status(200).send(linkJson);            
    } catch (error:any) {
        console.log(error);
          res.status(501).send(`Could Not Generate Addmoney Link`);
    } 
    }
}

//fund account callback
export const fundAccountCallback = async (req:Request, res:Response) => {
    // verify transaction
    let status = req.query.status;
    //cancelled transaction
    if (status == "cancelled") {
        const updateCancelledTransaction =await cancelledTransaction(req.query.tx_ref)
          res.status(400).send({message:updateCancelledTransaction});
    }else{
      const runVerify = await VerifyAddMOneyTransaction(req.query.tx_ref,req.query.transaction_id)
      res.status(201).send({message:runVerify});
    }
    
};

//transfers
export const transferRoute = async (req: Request, res: Response) => {
    const {
        amount,
        description,
        trans_type,
        email_sender,
        email_reciever,
    } = req.body;
    
    if (!amount || !description || trans_type !== "Transfer" || !email_reciever || !email_sender ||amount<1) {
      //incomplete Details
      res.status(400).send({error:"Bad Request"});
      return
    }
    //verifying reciever
    const validReciever = await verifyReciever(email_reciever);
    if (!validReciever) {
          res.status(400).send({message:"Invalid Reciever"});
          return
    } else{
    
       const id:string = await uuid();
      const newDescription:string =`${trans_type} of ${amount} from ${email_sender} to ${email_reciever} with message ${description}`
    const newTransaction = {
        id,
        trans_type,
        amount,
        description:newDescription,
        email_sender,
        email_reciever
    }
    try {
        
        await savePendindgTransaction(newTransaction);
        const sendMoney = await transfer(newTransaction);    
          res.status(200).send(sendMoney);
    } catch (error:any) {
        console.log(error);
          res.status(501).send("Internal Server error");
    }
    }   
}

//withdraw funds
export const withdraw = async(req:Request,res:Response)=>{
    let {bank_acc_name,bank_acc_num,bank,email_sender,amount,trans_type,description} =req.body;
    if (bank =="Access Bank") {
        bank = "044";
    }
    const transId = `${uuid()}9_PMCKDU_1`
    const withdrawRequest ={
        bank,bank_acc_name,bank_acc_num,email_sender,amount,trans_type,description,transId
    }
    if (!bank||!bank_acc_name||!bank_acc_num||!email_sender||!amount||trans_type !=="Withdrawal"||!description || amount<0) {
      res.status(400).send({message:"Bad Request"});
      return
    }
    const runWithdrawal = await makeWithdrawals(withdrawRequest); 
      res.status(200).send(runWithdrawal);
}

//withdraw callback
export const withdrawalCallback = async (req:Request, res:Response) => {
    // verify transaction
    const payload = req.body;
    const runVerifyWithdrawal = await verifyWithdrawal(payload);
    res.status(200).send(runVerifyWithdrawal);
};

//get all user transaction
export const userTransactions = async (req:Request, res:Response) => {   
    const transactions = await getUserTransactions(req.params.email)    
    res.status(200).send(transactions);
}