import express from 'express'
import { getThumbnailbyId, getUserThumbnails } from '../controllers/UserController';

const userRoute = express.Router();

userRoute.get("/thumbnails", getUserThumbnails);
userRoute.get("/thumbnail/:id", getThumbnailbyId);

export default userRoute;
