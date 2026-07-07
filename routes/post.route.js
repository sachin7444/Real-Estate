import express from 'express'
import { getPosts, getPost, addPost, updatePost, deletePost } from '../controllers/post.controller.js';
const router = express.Router();
import { verifyToken } from '../middleware/verifyToken.js';

router.get("/", getPosts)
router.get("/:id", getPost)
router.post("/",verifyToken, addPost)
router.put("/:id", verifyToken, updatePost)
router.delete("/:id", verifyToken, deletePost)

export default router;