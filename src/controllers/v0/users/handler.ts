import {
  Request,
  Response
} from 'express';
import {
  v4 as uuid
} from 'uuid';
import mysqlConnection from '../../../config';
import {
  createLogger
} from '../../../utils/logger';
import {
  getAccountDetails,
  saveNewUser
} from '../dataAccess/users';


const knex = require('knex')(mysqlConnection)
const logger = createLogger("User Router")


//get a user details from email 
export const getUserDetails = async (req: Request, res: Response) => {
  logger.info('Getting single User details')
  const userDetails = await getAccountDetails(req.params.email)
  if (userDetails.length > 0) {
    logger.info("User Found")
    res.status(200).send(userDetails);
  } else {
    logger.info("No User Found")
    res.status(200).json({
      message: 'No User Found'
    });
  }
}

// Create a new user Account
export const createNewUser = async (req: Request, res: Response) => {
  logger.info('Saving a new User');

  //gettting the email and full_name from req.bodys
  const {
    email,
    full_name
  } = req.body;
    if(!email || !full_name){
      res.status(400).send({message:"Bad Request"})
      return
    }
  // creating new user object 
  const newUser = {
    id: uuid(),
    email,
    full_name,
    acc_bal: 0.00
  }
  //call database to check if email already exists
  logger.info('Checking if user already exist');
  const userDetails = await getAccountDetails(email);

  if (userDetails.length < 1) {
    logger.info('Saving a new User');
    //save new user
    const saved = await saveNewUser(newUser)
    if (saved) {
      res.status(201).send(newUser);
    } else {
      res.status(501).send({
        message: "An Error Occured"
      });
    }
  } else {
    // User already Exist.
    logger.info('User Already Exist');
    res.status(201).json({
      message: 'User Already Exist'
    });
  }
}