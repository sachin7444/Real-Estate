import 'dotenv/config' 
import cookieParser from 'cookie-parser';
import express from "express"
import postRoute from "./routes/post.route.js";
import authRoute from './routes/auth.route.js'
const app = express();

app.use(express.json())
app.use(cookieParser())
app.use('/api', postRoute);
app.use('/api/auth', authRoute);

app.listen(8080, () => {
    console.log('Server is running');
});