import express from 'express'
import { deleteThumbnail, generateThumbnail } from '../controllers/ThumbnailController';
import protect from '../middleware/auth';

const thumbnailRoutes = express.Router();

thumbnailRoutes.post('/generated',protect,generateThumbnail);
thumbnailRoutes.post('/deleted/:id',protect,deleteThumbnail);

export default thumbnailRoutes;
