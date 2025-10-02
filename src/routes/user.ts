import express from 'express';
import {
  getAllUser,
  getUserProfile,
  updateUserData,
  createUser,
  updateUserById,
  deleteUserById,
} from '../controllers/user.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { checkPermission } from '../middlewares/checkRole';

const router = express.Router();

// Admin CRUD User
router.post('/', verifyToken, checkPermission('admin'), createUser);
router.put('/:id', verifyToken, checkPermission('admin'), updateUserById);
router.delete('/:id', verifyToken, checkPermission('admin'), deleteUserById);

// Người dùng
router.get('/', verifyToken, checkPermission('admin'), getAllUser);
router.get('/profile', verifyToken, getUserProfile);
router.put('/update', verifyToken, updateUserData);

export default router;
