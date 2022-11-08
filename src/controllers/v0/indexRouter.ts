import {Router} from 'express';
import {UserRouter} from './users/routes';
import {TranRouter} from './transactions/routes';

const router: Router = Router();

router.use('/transaction', TranRouter);
router.use('/users', UserRouter);


export const IndexRouter: Router = router;
