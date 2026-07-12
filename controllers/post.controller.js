import prisma from '../lib/prisma.js';
import jwt from "jsonwebtoken"


export const getPosts = async (req, res) => {
    const query = req.query;

    const token = req.cookies?.token;
    let tokenUserId = null;
    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
            tokenUserId = payload.id;
        } catch (err) {
            tokenUserId = null;
        }
    }

    try{
        const posts = await prisma.post.findMany({
            where:{
                city: query.city || undefined,
                type: query.type || undefined,
                property: query.property || undefined,
                bedroom: query.bedroom ? parseInt(query.bedroom) : undefined,
                bathroom: query.bathroom ? parseInt(query.bathroom) : undefined,
                price:{
                    gte: query.minPrice ? parseInt(query.minPrice) : 0,
                    lte: query.maxPrice ? parseInt(query.maxPrice) : 100000,
                }
            }
        });

        if (tokenUserId) {
            const savedPosts = await prisma.savedPost.findMany({
                where: { userId: tokenUserId },
                select: { postId: true },
            });
            const savedPostIds = new Set(savedPosts.map((sp) => sp.postId));

            const postsWithSaved = posts.map((post) => ({
                ...post,
                isSaved: savedPostIds.has(post.id),
            }));

            return res.status(200).json(postsWithSaved);
        }

        res.status(200).json(posts);
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to get posts"})
    }
}
export const getPost = async (req, res) => {
    const id = req.params.id;
    try{
        const post = await prisma.post.findUnique({
            where: { id },
            include:{
                postDetails: true,
                user: {
                    select:{
                        username: true,
                        avatar: true,
                    }
                },
            }
        });

        const token = req.cookies?.token;
        let userId = null;

        if (token) {
            try {
                const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
                userId = payload.id;
            } catch (err) {
                userId = null;
            }
        }

        let saved = null;
        if (userId) {
            saved = await prisma.savedPost.findUnique({
                where:{
                    userId_postId:{
                        postId: id,
                        userId,
                    },
                },
            });
        }

        res.status(200).json({...post, isSaved: saved ? true : false});
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to get post"})
    }
}
export const addPost = async (req, res) => {
    const body = req.body;
    const tokenUserId = req.userId;
    try{
        const {postDetails, ...postData} = body;

        const newPost = await prisma.post.create({
            data:{
                ...postData,
                userId: tokenUserId,
                postDetails:{
                    create:postDetails,
                },
            }
        })
        res.status(200).json(newPost);
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to add post"})
    }
}
export const updatePost = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;
    const body = req.body;
    try{
        const post = await prisma.post.findUnique({ where: { id } });

        if (post.userId !== tokenUserId) {
            return res.status(403).json({ message: "Not Authorized!" });
        }

        const updatedPost = await prisma.post.update({
            where: { id },
            data: { ...body },
        });
        res.status(200).json(updatedPost);
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to update posts"})
    }
}
export const deletePost = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;

    try{
        const post = await prisma.post.findUnique({
            where:{id}
        })
        if(post.userId !== tokenUserId){
            return res.status(403).json({message:"Not Authorized! "})
        }
        await prisma.post.delete({
            where:{id},
        });
        
        res.status(200).json({message:"Post deleted"});
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to delete posts"})
    }
}
