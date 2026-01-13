import { Request, Response } from "express"
import thumbnailModel from "../model/Thumbnail";

// Controller to get all user thumbnails
export const getUserThumbnails = async (req:Request, res:Response) => {
    try {
        const {userId} = req.session;

        const thumbnail = await thumbnailModel.find({userId}).sort({createdAt:-1})

        res.json({
            thumbnail
        })
    } catch (error:any) {
       console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    }); 
    }
}

// Controller to get single Thumbnail of a user
export const getThumbnailbyId = async (req:Request, res:Response) => {
    try {
        const {userId} = req.session;
        const {id} = req.body

        const thumbnail = await thumbnailModel.findOne({_id:id, userId})

        res.json({
            thumbnail
        })
    } catch (error:any) {
       console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    }); 
    }
}