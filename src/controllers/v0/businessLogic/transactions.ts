import mysqlConnection, {
    ENV
} from '../../../config';
import addMoney from './addMoney';
import {
    runWithdrawal,
    withdrawalStatus
} from './withdraw';
import {
    createLogger
} from '../../../utils/logger';
import {
    getAccountDetails,
    updateUserAccBal
} from '../dataAccess/users';
import {
    getTransaction,
    getUserTransactions,
    savePendindgTransaction,
    updateTransactionStatus
} from '../dataAccess/transactions';

const logger = createLogger("Utils Functions")

const Flutterwave = require('flutterwave-node-v3');

const flw = new Flutterwave(ENV.FLW_PUBLIC_KEY, ENV.FLW_SECRET_KEY);
const knex = require('knex')(mysqlConnection);

//getting the Payment link
export const addMoneyLink = async (email: string, amount: Number, transId: string, full_name: string) => {
    logger.info("Get Fund Account Link")
    const putMoney = await addMoney(amount, transId, full_name);
    return putMoney
}

export const PendindgTransaction = async (newTransaction: any) => {
    logger.info("Saving Pending Transaction");
    const saved = await savePendindgTransaction(newTransaction)
    return saved;
}

export const VerifyAddMOneyTransaction = async (tx_ref: any, transactionId: any) => {
    logger.info("Verifing Add Money Transaction")
    //get transaction details from DB

    const transactionDetails =await getTransaction(tx_ref) 
    let expectedAmount: Number = transactionDetails[0].amount
    let email: string = transactionDetails[0].email_sender
    
    logger.info("Flutterwave Verify Transaction")
    const response = await flw.Transaction.verify({
        id: transactionId
    })
    if (
        response.data.status === "successful" &&
        response.data.amount === expectedAmount &&
        response.data.currency === "NGN") {
        // Success! Confirm the customer's payment
        try {
            logger.info("Successful Transaction")
            // update transaction from pending to Completed
            await updateTransactionStatus(tx_ref, "Completed") 
            // update Account Balance 
            const getAccountBalance =  await getAccountDetails(email);
            // compute new balance
            const new_Acc_Bal = getAccountBalance[0].acc_bal + response.data.amount;
            // save new balance
            await updateUserAccBal(email, new_Acc_Bal);
            return {message:`Completed`};
        } catch (error:any) {
            console.log(error);
            return {message:`An error Occured`}
        }
    } else {
        logger.info("Failed Transaction");
        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        await updateTransactionStatus(tx_ref, "Failed")      
        return {message:`Failed`};
    }
}

export const cancelledTransaction = async (tx_ref: any) => {
    logger.info("Cancelled Add Money Transaction");
    // update transaction from pending to Cancelled
    await updateTransactionStatus(tx_ref, "Cancelled") 
    return {message:`transaction ${tx_ref}  Cancelled`}
}

export const transfer = async (transaction: any, amountCharge: number) => {
    logger.info("Transfer Money");
    try {  
    const sender = await getAccountDetails(transaction.email_sender);
    let senderNewBalance = sender[0].acc_bal - amountCharge;    
    // save new balance ofsender
    await updateUserAccBal(transaction.email_sender, senderNewBalance)
    
    logger.info("Updating Reciever");
    const reciever = await getAccountDetails(transaction.email_reciever)
    let recieverNewBalance = reciever[0].acc_bal + transaction.amount;
    
    // save new Reciever balance
    await updateUserAccBal(transaction.email_reciever, recieverNewBalance)
    //update transaction status
    await updateTransactionStatus(transaction.id, "Completed")
    return {
        message: `Completed ${transaction.description}`,
        status: "Success"
    }   
    } catch (error:any) {
        console.log(error);
        return {message:"An error Occured"};
    }
}

export const makeWithdrawals = async (withdrawal: any) => {
    const {
        bank_acc_name,
        bank_acc_num,
        email_sender,
        amount,
        transId,
        trans_type,
    } = withdrawal;

    logger.info("Make Withdrawal");

    let newDescription = `Withdrawal to ${bank_acc_name} ${bank_acc_num} ${withdrawal.description}`
    const newTransaction = {
        email_sender,
        amount,
        trans_type,
        id: transId,
        description: newDescription
    }
    //saving pendng Trasaction
    await savePendindgTransaction(newTransaction);

    const withdrawMoney = await runWithdrawal(withdrawal)
    //verify transaction

    if (
        withdrawMoney.status === "success" && withdrawMoney.message == "Transfer Queued Successfully" &&
        withdrawMoney.data.amount === amount &&
        withdrawMoney.data.currency === "NGN" && withdrawMoney.data.account_number ==bank_acc_num) {
        // Success! Confirm the customer's payment
        try {
            logger.info("Withdraw Transaction Queued");
            // update transaction from pending to Queued
            //update transaction status
            await updateTransactionStatus(withdrawal.transId, "Queued")
    
            //verify transaction
            runIn2Mins(withdrawMoney.data.id)
            return withdrawMoney
        } catch (error:any) {
            console.log(error);
            return {message:"An Error Occured"}   
        }
    } else {
        logger.info("Withdraw Transaction Failed");
        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        await updateTransactionStatus(withdrawal.transId, "Failed")
        return withdrawMoney
    }
}

export const verifyWithdrawal = async (payload: any) => {
 logger.info("Verify Withdrawal Transaction ");

    //get Transaction details from DB
    const transactionDetails = await getTransaction(payload.data.reference)
    let expectedAmount: Number = transactionDetails[0].amount
    let email: string = transactionDetails[0].email_sender

    if (transactionDetails[0].status == "Failed" || transactionDetails[0].status == "Completed") {
        //transaction Already Failed or Completed
        return {message:"Transaction Already Updated"}
    }
    if (
        payload.data.status === "SUCCESSFUL" &&
        payload.data.amount === expectedAmount &&
        payload.data.currency === "NGN") {
        // Success! Confirm the customer's payment
        try {
            logger.info("Withdraw Transaction Successfull");
            // update transaction from Queued to Completed
            await updateTransactionStatus(payload.reference,"Completed")
            // update Account Balance
            const getAccountBalance = await getAccountDetails(email)
            // compute new balance
            const new_Acc_Bal = Math.floor(getAccountBalance[0].acc_bal - payload.data.amount - payload.data.fee);
            // save new balance
            await updateUserAccBal(email, new_Acc_Bal)

            return {message:"Transaction Completed"};
        } catch (error:any) {
            console.log(error);
            return {message:"An error Occured"};
        }
    } else {
        logger.info("Withdraw Transaction Failed");
        //update transaction from Queued to Failed
        await updateTransactionStatus(payload.reference, "Failed")
        return {message:"Transaction Failed"};
    }
}

export const UserTransactions = async (email: string) => {
    const thisUserTransaction = await getUserTransactions(email)
    return thisUserTransaction;
}

// runs a function to verify withdrawal status every 10 mins
const runIn2Mins = async (id: any) => {
    logger.info("Will verify Withdrawal in 2 Mins")
    setTimeout(async () => {
        const checkStatus = await withdrawalStatus(id);
        verifyWithdrawal(checkStatus)
    }, 120000);
}