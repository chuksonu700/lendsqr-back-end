import mysqlConnection from '../../../config';
import {createLogger} from '../../../utils/logger';

const knex = require('knex')(mysqlConnection);

const logger = createLogger("Utils Functions")

export const getAccountDetails = async(email:string)=>{
    logger.info("Get Account Balance");
    const rows = await knex.from('users').where({email:email}).select("id","email","acc_bal","full_name");

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