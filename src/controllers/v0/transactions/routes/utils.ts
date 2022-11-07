import {
    mysqlConnection
} from '../../../../config/config';
import fundAccount2 from './fund';
import dotenv from 'dotenv';
import {
    runWithdrawal
} from './withdraw';
import {
    createLogger
} from '../../../../utils/logger';


const logger = createLogger("Utils Functions")

dotenv.config();
const Flutterwave = require('flutterwave-node-v3');

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const knex = require('knex')(mysqlConnection);

//getting the Payment link
export const getFundAccountLink = async (email: string, amount: Number, transId: string, full_name: string) => {

    logger.info("Get Fund Account Link")
    const putMoney = await fundAccount2(email, amount, transId, full_name);
    return putMoney
}

export const savePendindgTransaction = async (newTransaction: any) => {

    logger.info("Saving Pending Transaction");
    knex('transactions').insert(newTransaction)
        .catch((err: any) => {
            console.log(err);
            throw err;
        })
        .finally(() => {
            return 'Transaction Inserted'
        })
}

export const VerifyAddMOneyTransaction = async (tx_ref: any, transactionId: any) => {
    
    logger.info("Verifing Add Money Transaction")
    const rows = await knex.from('transactions').where({
        id: tx_ref
    }).select("id", "amount", "trans_type", "email_sender");
    
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

            return `transaction ${rows[0].trans_type} ${rows[0].amount} Completed`;
        } catch (error) {
            console.log(error);
        }

    } else {
        logger.info("Failed Transaction");
        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        const rows = await knex('transactions').where({
            id: tx_ref
        }).update({
            status: "Failed"
        }, ["id", "trans_type", "amount"]);
        return `transaction ${rows[0].trans_type} ${rows[0].amount} Failed`;
    }
}

export const cancelledTransaction = async (tx_ref: any) => {

    
    logger.info("Cancelled Add Money Transaction");
    // update transaction from pending to Cancelled
    const rows = await knex('transactions').where({
        id: tx_ref
    }).update({
        status: "Cancelled"
    }, ["id"]);
    return `transaction ${tx_ref}  Cancelled`
}

export const transfer = async (transaction: any) => {
    
    logger.info("Transfer Money");
    let charge: Number = Math.ceil(transaction.amount * 0.01)
    let amountCharge = transaction.amount + charge;
    // check account balance of sender
    logger.info("Check account balance of sender");
    const sender = await knex.from('users').where({
        email: transaction.email_sender
    }).select("id", "acc_bal");

    if (sender[0].acc_bal > amountCharge) {
        let senderNewBalance = sender[0].acc_bal - amountCharge;
        // save new balance
        const updatedSenderAccountBalance = await knex('users').where({
            email: transaction.email_sender
        }).update({
            acc_bal: senderNewBalance
        });
    } else {
        const rows = await knex('transactions').where({
            id: transaction.id
        }).update({
            status: "Failed insuficient Funds"
        });
        return "insuficient Funds"
    }
    const reciever = await knex.from('users').where({
        email: transaction.email_reciever
    }).select("id", "acc_bal");
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
    return `transaction ${transaction.id}  Completed`
}

export const verifyReciever = async (email: any) => {
    const rows = await knex.from('users').where({
        email: email
    }).select("id", "email")

    if (rows.length < 1) {
        return false
    } else {
        return true
    }
}

export const makeWithdrawals = async (withdrawal: any) => {
    const {
        bank,
        bank_acc_name,
        bank_acc_num
    } = withdrawal;
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
    let email: string = rows[0].email_sender
    if (
        withdrawMoney.status === "success" &&
        withdrawMoney.data.amount === expectedAmount &&
        withdrawMoney.data.currency === "NGN" && withdrawMoney.data.account_number) {
        // Success! Confirm the customer's payment
        try {
            // update transaction from pending to Queued
            const updatedId = await knex('transactions').where({
                id: withdrawal.transId
            }).update({
                status: "Queued"
            });
            return `transaction ${rows[0].trans_type} ${rows[0].amount}, ${rows[0].description} Queued`;
        } catch (error) {
            console.log(error);
        }

    } else {

        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        const setFailed = await knex('transactions').where({
            id: withdrawal.transId
        }).update({
            status: "Failed"
        });
        return `transaction ${rows[0].trans_type} ${rows[0].amount}, ${rows[0].description} Failed`;
    }

}

export const verifyWithdrawal = async (payload: any) => {
    const rows = await knex.from('transactions').where({
        id: payload.reference
    }).select("id", "amount", "trans_type", "email_sender", "description");
    let expectedAmount: Number = rows[0].amount
    let email: string = rows[0].email_sender
    if (
        payload.data.status === "SUCCESSFUL" &&
        payload.data.amount === expectedAmount &&
        payload.data.currency === "NGN") {
        // Success! Confirm the customer's payment
        try {
            // update transaction from Queued to Completed
            const updatedId = await knex('transactions').where({
                id: payload.reference
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

            return `transaction ${rows[0].trans_type} ${rows[0].amount}, ${rows[0].description} Completed`;
        } catch (error) {
            console.log(error);
        }

    } else {

        // Inform the customer their payment was unsuccessful
        //update transaction from pending to Failed
        const setFailed = await knex('transactions').where({
            id: payload.reference
        }).update({
            status: "Failed"
        });
        return `transaction ${rows[0].trans_type} ${rows[0].amount}, ${rows[0].description} Failed`;
    }
}