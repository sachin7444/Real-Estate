import 'dotenv/config' 
import express from 'express'
import cookieParser from 'cookie-parser';
import cors from "cors"

import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';

const app = express();

app.use(cors({origin:process.env.CLIENT_URL, credentials: true}))
app.use(express.json())
app.use(cookieParser())

app.use('/api', postRoute);
app.use('/api/auth', authRoute);
app.use('/api/test', testRoute);
app.use('/api/users', userRoute);

app.listen(8080, () => {
    console.log('Server is running');
});