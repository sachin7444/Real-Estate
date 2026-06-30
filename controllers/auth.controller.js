import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import jwt  from 'jsonwebtoken';


export const register = async (req, res) => {
    const {username, email, password} = req.body;
    //hash the password

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword)

    //Create a new user and save the db
    const newUser = await prisma.user.create({
        data:{
            username,
            email,
            password: hashedPassword,
        },
    });
    console.log(newUser)
    res.status(201).json({message: "User Created successfully"})

    }catch(error){
        console.log(error)
        res.status(500).json({message: "Failed to create user!"})
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

    //generate cookie token and send to the user
    // Set cookies before sending the response. Use `res.cookie` and send one response only.
    const age = 1000 * 60 *60 *24 *7;    

    const token = jwt.sign(
        {
            id: user.id
        },
        "process.env.JWT_SECRET_KEY",
        { expiresIn: age }
    );
   
    res.
        cookie("token", token, { 
            httpOnly: true,
             maxAge: age
            });
    return res.status(200).json({ message: 'Login Successful' });

}catch(err){
    console.log(err)
    res.status(500).json({message: "Failed to login"})
    }
};

export const logout = (req, res) => {
    // Clear cookies on logout
    res.clearCookie('token').status(200).json({message:"Logout successful"});
    res.clearCookie('test2');
    return res.status(200).json({ message: 'Logged out' });
}