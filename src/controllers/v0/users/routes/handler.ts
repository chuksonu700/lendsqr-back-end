import { Request, Response} from 'express';
import {  v4 as uuid } from 'uuid';
import  mysqlConnection from '../../../../config/config';
import { createLogger } from '../../../../utils/logger';


const knex = require('knex')(mysqlConnection)
const logger = createLogger("User Router")


//get a user details from email 
export const getUserDetails = async (req: Request, res: Response) => {

  logger.info('Getting single User details')
  console.log(req.params.email);
  const rows = await knex.from('users').where({email:req.params.email}).select("id","email","acc_bal","full_name");
  if (rows.length>0) {
    logger.info("User Found")
    res.status(200).send(rows);
  } else {
    logger.info("No User Found")
    res.status(201).json({message:'No User Found'});
  } 
}

// Create a new user Account
export const createNewUser = async (req: Request, res: Response) => {
  logger.info('Saving a new User');
  
  //gettting the email and full_name from req.bodys
  const { email, full_name } = req.body;

  // creating new user object 
  const newUser = {
    id: uuid(),
    email,
    full_name,
    acc_bal: 0.00
  }

  //call database to check if email already exists
  logger.info('Checking if user already exist');
  const rows = await knex.from('users').where({email: email}).select("id", "email")
  
  if (rows.length < 1) {
    
    logger.info('Saving a new User');
    //save new user
    knex('users').insert(newUser)
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        logger.info("return New User")
        res.status(200).send(newUser);
      })

  } else {
   // User already Exist.
    logger.info('User Already Exist');
    res.status(201).json({message:'User Already Exist'});
  }
}