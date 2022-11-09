import mysqlConnection from '../../../config';
import {createLogger} from '../../../utils/logger';

const knex = require('knex')(mysqlConnection);

const logger = createLogger("Utils Functions")

export const getAccountDetails = async(email:string)=>{
    logger.info("Get Account Balance");
    const rows = await knex.from('users').where({email:email}).select("id","email","acc_bal","full_name")
    .catch((err: any) => {
        console.log(err);
        return {message:`An error Occured`}
    });
    return  rows    
}

export const verifyEmail = async (email: any) => {
    logger.info("verify Reciever's Email");
    const rows = await getAccountDetails(email)
     if (rows.length < 1) {
        return false
    } else {
        return true
    }
}

export const updateUserAccBal=async(email:string,acc_bal:number)=>{
    const updateAccountBalance = await knex('users').where({
        email: email
    }).update({
        acc_bal: acc_bal
    }).catch((err: any) => {
        console.log(err);
        return {message:`An error Occured`}
    });   
    return updateAccountBalance;
}

export const saveNewUser =async (newUser:Object) => {
    await knex('users').insert(newUser)
    .catch((err: any) => {
      console.log(err);        
      return false
    })
    return true;
}