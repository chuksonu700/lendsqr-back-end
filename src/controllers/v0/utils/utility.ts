import mysqlConnection from '../../../config';
import {createLogger} from '../../../utils/logger';

const knex = require('knex')(mysqlConnection);

const logger = createLogger("Utils Functions")

export const getAccountDetails = async(email:string)=>{
    logger.info("Get Account Balance");
    const rows = await knex.from('users').where({email:email}).select("id","email","acc_bal","full_name");

    if (rows.length < 1) {
        return {message:"Not found"}
    } else {
        return  rows[0]     
    }
}