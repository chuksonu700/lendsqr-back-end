import mysqlConnection, {ENV} from '../../../config';
import addMoney from './addMoney';
import {
    runWithdrawal, withdrawalStatus
} from './withdraw';
import {
    createLogger
} from '../../../utils/logger';
import { getAccountDetails } from '../helpers/users';


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

export const savePendindgTransaction = async (newTransaction: any) => {

    logger.info("Saving Pending Transaction");
    knex('transactions').insert(newTransaction)
        .catch((err: any) => {
            console.log(err);
            return false;
        })
        .finally(() => {
            return 'Transaction Inserted'
        })
}

export const VerifyAddMOneyTransaction = async (tx_ref: any, transactionId: any) => {
    
    logger.info("Verifing Add Money Transaction")
    const rows = await knex.from('transactions').where({
        id: tx_ref
    }).select("id", "amount", "trans_type", "email_sender","description");
    
    let expectedAmount: Number = rows[0].amount
    let email: string = rows[0].email_sender
    logger.info("Flutterwave Verify Transaction")
    const response = await flw.Transaction.verify({id: transactionId})
    if (
        response.data.status === "successful" &&
        response.data.amount === expectedAmount &&
        response.data.currency === "NGN") {
        // Success! Confirm the customer's payment
        try {
            logger.info("Successful Transaction")
            // update transaction from pending to Completed
            const updatedId = await knex('transactions').where({
                id: tx_ref
            }).update({
                status: "Completed"
            }, ["id"]);
            // update Account Balance
            const getAccountBalance = await knex.from('users').select("id", "acc_bal").where({
                email: email
            });
            // compute new balance
            const new_Acc_Bal = getAccountBalance[0].acc_bal + response.data.amount;
            // save new balance
            const updatedAccountBalance = await knex('users').where({
                email: email
            }).update({
                acc_bal: new_Acc_Bal
            }, ["id"]);

            return `Completed`;
        } catch (error) {
            console.log(error);
            throw error;
        }
    } else {
        logger.info("Failed Transaction");
        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        const updateTransactionTOFailled = await knex('transactions').where({
            id: tx_ref
        }).update({
            status: "Failed"
        });
        return `Failed`;
    }
}

export const cancelledTransaction = async (tx_ref: any) => {

    logger.info("Cancelled Add Money Transaction");
    // update transaction from pending to Cancelled
    const rows = await knex('transactions').where({
        id: tx_ref
    }).update({
        status: "Cancelled"
    });
    return `transaction ${tx_ref}  Cancelled`
}

export const transfer = async (transaction: any,amountCharge:number) => {
    
        logger.info("Transfer Money");
        const sender = await getAccountDetails(transaction.email_sender);
        let senderNewBalance = sender[0].acc_bal - amountCharge;
        // save new balance ofsender
        const updatedSenderAccountBalance = await knex('users').where({
            email: transaction.email_sender
        }).update({
            acc_bal: senderNewBalance
        });
        
    logger.info("Updating Reciever");
    const reciever = await getAccountDetails(transaction.reciever)
    let recieverNewBalance = reciever[0].acc_bal + transaction.amount;
    // save new balance
    const updatedRecieverAccountBalance = await knex('users').where({
        email: transaction.email_reciever
    }).update({
        acc_bal: recieverNewBalance
    });

    const rows = await knex('transactions').where({
        id: transaction.id
    }).update({
        status: "Completed"
    });
    return {message:`Completed ${transaction.description}`,status:"Success"}

}

export const makeWithdrawals = async (withdrawal: any) => {
    const {
        bank,
        bank_acc_name,
        bank_acc_num,email_sender,amount,trans_type,
    } = withdrawal;

    logger.info("Make Withdrawal");

    let newDescription = `Withdrawal to ${bank_acc_name} ${bank_acc_num} ${withdrawal.description}`
    const newTransaction = {
        email_sender: withdrawal.email_sender,
        amount: withdrawal.amount,
        trans_type: withdrawal.trans_type,
        id: withdrawal.transId,
        description: newDescription
    }
    
    //saving pendng Trasaction
    await savePendindgTransaction(newTransaction);

    const withdrawMoney = await runWithdrawal(withdrawal)
    
    //verify transaction
    const rows = await knex.from('transactions').where({
        id: withdrawal.transId
    }).select("id", "amount", "trans_type", "email_sender", "description");
    
    let expectedAmount: Number = rows[0].amount
    
    if (
        withdrawMoney.status === "success" &&
        withdrawMoney.data.amount === expectedAmount &&
        withdrawMoney.data.currency === "NGN" && withdrawMoney.data.account_number) {
        // Success! Confirm the customer's payment
        try {
            logger.info("Withdraw Transaction Queued");
            // update transaction from pending to Queued
            const updatedId = await knex('transactions').where({
                id: withdrawal.transId
            }).update({
                status: "Queued"
            });
            
            runIn2Mins(withdrawMoney.data.id)
            return withdrawMoney
        } catch (error) {
            console.log(error);
        }

    } else {
        logger.info("Withdraw Transaction Failed");
        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        const setFailed = await knex('transactions').where({
            id: withdrawal.transId
        }).update({
            status: "Failed"
        });
        return withdrawMoney
    }

}

export const verifyWithdrawal = async (payload: any) => {
    
    logger.info("Verify Withdrawal Transaction ");

    //get Transaction details from DB
    const rows = await knex.from('transactions').where({
        id: payload.data.reference
    }).select("id", "amount", "trans_type", "email_sender", "description","status");
    
    let expectedAmount: Number = rows[0].amount
    let email: string = rows[0].email_sender
    
    if (rows[0].status == "Failed" ||rows[0].status == "Completed" ) {
        //transaction Already Failed or Completed
        console.log("Already Updated")
        return "Transaction Already Updated"
    }
    if (
        payload.data.status === "SUCCESSFUL" &&
        payload.data.amount === expectedAmount &&
        payload.data.currency === "NGN") {
        // Success! Confirm the customer's payment
        try {
            
            logger.info("Withdraw Transaction Successfull");
            // update transaction from Queued to Completed
            const updatedId = await knex('transactions').where({
                id: payload.data.reference
            }).update({
                status: "Completed"
            });
            // update Account Balance
            const getAccountBalance = await knex.from('users').select("id", "acc_bal").where({
                email: email
            });
            // compute new balance
            const new_Acc_Bal = Math.floor(getAccountBalance[0].acc_bal - payload.data.amount - payload.data.fee);
            // save new balance
            const updatedAccountBalance = await knex('users').where({
                email: email
            }).update({
                acc_bal: new_Acc_Bal
            });

            return "Saved Completed";
        } catch (error) {
            console.log(error);
            return "501 error";
        }

    } else {
        
        logger.info("Withdraw Transaction Failed");
        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        const setFailed = await knex('transactions').where({
            id: payload.reference
        }).update({
            status: "Failed"
        });
        return "saved Failed";
    }
}

export const getUserTransactions =async (email:string) => {
    const rows = await knex.from('transactions').where({email_sender:email}).orWhere({email_reciever:email}).select("*");
    return rows;
}
// runs a function to verify withdrawal status every 10 mins
const runIn2Mins = async(id: any) => {
    logger.info("Will verify Withdrawal in 2 Mins")
    setTimeout(async() => {
        const checkStatus = await withdrawalStatus(id);
        console.log(checkStatus)
        verifyWithdrawal(checkStatus)
    }, 90000); 
}