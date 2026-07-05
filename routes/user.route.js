import express from 'express'
import {login, logout, register}  from '../controllers/auth.controller.js'
import {getUsers, getUser, updateUser, deleteUser} from '../controllers/user.controller.js'
import {verifyToken} from '../middleware/verifyToken.js'

const router = express.Router();

router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUser);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);

export default router;