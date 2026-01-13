import express, { Application, Request, Response } from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config();
import connectDB from './config/bd';
import session from 'express-session';
import MongoStore from "connect-mongo"
import AuthRouter from './routes/AuthRoutes';
import thumbnailRoutes from './routes/ThumbnailRoutes';
import userRoute from './routes/UserRoutes';


declare module 'express-session'{
    interface SessionData {
        isLoggedIn: boolean;
        userId: string
    }
}

const app: Application = express();

app.use(express.json());
app.use(cors({
    origin:['http://localhost:5173','http://localhost:3000'],
    credentials:true
}))
app.use(session({
    secret:process.env.SECRET_SESSION_KEY as string,
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:1000 * 60 * 60 * 24 * 7},
    store:MongoStore.create({
        mongoUrl:process.env.MONGOOSE_URL as string,
        collectionName:'session'
    })
    
}))
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});
app.use("/api/auth", AuthRouter)
app.use("/api/generate", thumbnailRoutes)
app.use("/api/user", userRoute)


connectDB()
const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/`);
});
