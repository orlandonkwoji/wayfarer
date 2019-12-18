import { Router } from 'express';
import Users from '../controllers/users';
import Authorization from '../middleware/authorization';
import Validate from '../middleware/validate';

const { verifyAdmin, verifyUser } = Authorization;
const { validateParamsEmail } = Validate;
const router = Router();

// Import controllers
const { userVerification, userLoans, allUsers } = Users;

// Verify new user
router.patch('/:email/verify', verifyAdmin, validateParamsEmail, userVerification);
// Get all users (clients)
router.get('/', verifyAdmin, allUsers);
// Get user loans
router.get('/userloans', verifyUser, userLoans);

export default router;
