import { Router } from 'express';
import Validate from '../middleware/validate';
import Users from '../controllers/users';

const router = Router();

// Import controllers
const { signUp, signIn } = Users;
// Import validators
const { validateSignup, validateSignin } = Validate;
// New User Signup
router.post('/signup', validateSignup, signUp);

// User signin
router.post('/signin', validateSignin, signIn);

export default router;
