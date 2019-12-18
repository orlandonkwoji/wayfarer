import { Router } from 'express';
import { Buses } from '../controllers';
import Authorization from '../middleware/authorization';
import Validate from '../middleware/validate';

const { addBusValidator, getABusValidator } = Validate;
const router = Router();
const { addBus, getABus } = Buses;
const { verifyAdmin } = Authorization;

router.post('/', verifyAdmin, addBusValidator, addBus);
router.get('/:bus_id', verifyAdmin, getABusValidator, getABus);

export default router;
