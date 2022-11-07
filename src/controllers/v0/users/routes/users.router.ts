import { Router, Request, Response} from 'express';
import {  v4 as uuid } from 'uuid';
import {  mysqlConnection} from '../../../../config/config';
import { createLogger } from '../../../../utils/logger';


const router: Router = Router();
const knex = require('knex')(mysqlConnection)
const logger = createLogger("User Router")


//get a user details from email 
router.get('/:email', async (req: Request, res: Response) => {

  logger.info('Getting single User details')
  const rows = await knex.from('users').where({email:req.params.email}).select("id","email","acc_bal","full_name");
  
  res.send(rows[0]);
})


router.post('/', async (req: Request, res: Response) => {
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
        const result = {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
          body: {
            items: newUser
          }
        }
        res.send(result);
      })

  } else {

    //Const User already Exist.
    logger.info('User Already Exist');
    const result = {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: 'user Already Exist'
    }

    res.send(result);
  }
})

export const UserRouter: Router = router;