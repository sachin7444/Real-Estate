import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import jwt  from 'jsonwebtoken';


export const register = async (req, res) => {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        if (existingUser) {
            return res.status(409).json({ message: "Username or email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.log(error);

        if (error?.code === 'P2002') {
            return res.status(409).json({ message: "Username or email already exists" });
        }

        return res.status(500).json({ message: "Failed to create user!" });
    }
};

export const login = async (req, res) => {
    const {username, password} = req.body;
    
    try{
    //if the user exists
    const user = await prisma.user.findUnique({
        where:{username}
    })
    if(!user) return res.status(401).json({message:"Invalid credentials!"})
    //check if the password is correct

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid) 
        return res.status(401).json({message:"Invalid Credentials"})

    const age = 1000 * 60 *60 *24 *7;    

    const token = jwt.sign(
        {
            id: user.id,
            isAdmin: false,

        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: age }
    );
   
    const {password:userPassword, ...userInfo} = user

    res.cookie("token", token, {
        httpOnly: false,
        maxAge: age,
        sameSite: "lax",
        path: "/"
    });
    return res.status(200).json(userInfo);

}catch(err){
    console.log(err)
    res.status(500).json({message: "Failed to login"})
    }
};

export const logout = (req, res) => {
    // Clear cookies on logout and send a single response
    res.clearCookie('token');
    res.clearCookie('test2');
    return res.status(200).json({ message: 'Logged out' });
}