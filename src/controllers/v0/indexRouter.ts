import {Router, Request, Response} from 'express';
import { request } from 'http';
import {UserRouter} from './users/routes/users.router';
import {TranRouter} from './transactions/routes/transactions';

const router: Router = Router();

router.use('/transaction', TranRouter);
router.use('/users', UserRouter);


export const IndexRouter: Router = router;
