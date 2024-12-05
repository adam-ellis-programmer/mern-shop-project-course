import { protect, admin } from '../middleware/authMiddleWare.js'

import express from 'express'
import {
  authUser, 
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} from '../controllers/userController.js'

const router = express.Router()

router.route('/').post(registerUser).get(protect, admin, getUsers)
router.post('/logout', logoutUser)
router.post('/login', authUser) // change name
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile)
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)

export default router
