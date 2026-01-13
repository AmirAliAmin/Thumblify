import User from "../model/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
// Controller For User Registration
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already Exists",
        success: false,
        error: true,
      });
    }

    //encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashPassword,
    });
    await newUser.save();

    req.session.isLoggedIn = true;
    req.session.userId = newUser._id.toString();

    return res.status(200).json({
      message: "Account created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      success: true,
      error: false,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

//Controller For Login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "You are not Register",
        success: false,
        error: true,
      });
    }
    const isPassword = await bcrypt.compare(password, user.password as string);
    if (!isPassword) {
      return res.status(400).json({
        message: "Password is not Valid",
        success: false,
        error: true,
      });
    }
    req.session.isLoggedIn = true;
    req.session.userId = user._id.toString();

    return res.status(200).json({
      message: "Logged In successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      success: true,
      error: false,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

//Controller For Logout
export const logoutUser = async (req: Request, res: Response) => {
  try {
    req.session.destroy((error: any) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          message: error.message,
          success: false,
          error: true,
        });
      }
    });
    return res.status(200).json({
      message: "Logout Succesfully",
      success: true,
      error: false,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};

// controller for User Verify
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const {userId} = req.session;
    const user = await User.findById(userId).select('-password')

    if (!user) {
         return res.status(400).json({
        message: "Invalid User",
        success: false,
        error: true,
      });
    }
    return res.status(200).json({
      user,
      success: true,
      error: false,
    });
  } catch (error:any) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};
