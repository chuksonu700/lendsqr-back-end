import {
    Router,
} from 'express';

import { addMoney, fundAccountCallback, transferRoute, withdraw, withdrawalCallback,userTransactions } from '../handler';

const router: Router = Router();

router.post('/add-money', addMoney)

router.get('/fund-account-callback', fundAccountCallback);

router.post('/transfer',transferRoute)

router.post('/withdraw', withdraw)

router.get('/withdrawal-callback', withdrawalCallback);

router.get('/:email', userTransactions);

export const TranRouter: Router = router;