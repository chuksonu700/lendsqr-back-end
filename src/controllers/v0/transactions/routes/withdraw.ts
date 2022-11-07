import dotenv from 'dotenv';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger("Withdrawal")

dotenv.config();
const Flutterwave = require('flutterwave-node-v3');


const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

//Run Withdrawal
export const runWithdrawal =async (withdrawRequest:any)=>{
    logger.info("Executing Withdrawal");

    //detials for the Transaction
    const details = {
        account_bank: withdrawRequest.bank,
        account_number: withdrawRequest.bank_acc_num,
        amount: withdrawRequest.amount,
        narration: "Payment for things",
        currency: "NGN",
        reference: withdrawRequest.transId,
        callback_url: "http://localhost:8000/api/v0/transaction/withdrawal-callbacK",
        debit_currency: "NGN"
    };

    const queueWithdrawal = await  flw.Transfer.initiate(details)

    logger.info("Withdrawal Completed")
    return queueWithdrawal;
}
