import prisma from '../lib/prisma.js';

export const getPosts = async (req, res) => {
    try{
        const posts = await prisma.post.findMany();

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

        res.status(200).json(post);
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to get post"})
    }
}

export const addPost = async (req, res) => {
    const body = req.body;
    const tokenUserId = req.userId;
    try{
        const newPost = await prisma.post.create({
            data:{
                ...body.postData,
                userId: tokenUserId,
                postDetails:{
                    create:body.postDetails,
                },
            }
        })
        res.status(200).json(newPost);
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to adds posts"})
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
