import mysqlConnection from '../../../config';

const knex = require('knex')(mysqlConnection);

export const AddCharge = (amount:number)=>{
    let newAmount:number = Math.ceil(amount*0.01) + amount
    return newAmount
}

export const getTransaction =async(transactionId:string)=>{
    const transaction = await knex.from('transactions').where({
        id: transactionId
    }).select("id", "amount", "trans_type", "email_sender", "description", "status")
    .catch((err: any) => {
        console.log(err);
        return {message:`An error Occured`}
    })
    return transaction;
}
export const updateTransactionStatus =async(transactionId:string,status:string)=>{
    const updateTransaction =  await knex('transactions').where({
        id: transactionId
    }).update({
        status: status
    }).catch((err: any) => {
        console.log(err);
        return {message:`An error Occured`}
    });
    return updateTransaction;
}
export const savePendindgTransaction = async (newTransaction: any) => {
    knex('transactions').insert(newTransaction)
        .catch((err: any) => {
            console.log(err); 
            return {message:`An error Occured`}
        })
        .finally(() => {
            return {message:'Pending Transaction Inserted'}
        })
}
export const getUserTransactions = async (email: string) => {
    const userTransaction = await knex.from('transactions').where({
        email_sender: email
    }).orWhere({
        email_reciever: email
    }).select("*")
    .catch((err: any) => {
        console.log(err); 
        return {message:`An error Occured`}
    })
    return userTransaction;
}