import { Router } from 'express';
import { createNewUser, getUserDetails } from './handler';

const router: Router = Router();

//get a user details from email 
router.get('/:email', getUserDetails)

//Create Account
router.post('/create-account', createNewUser)

export const UserRouter: Router = router;