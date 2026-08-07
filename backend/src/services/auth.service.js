import User from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUtils.js";
import sendEmail from "../utils/sendEmail.js";

import crypto from "crypto";
import fs from "fs";

export const register = async (req) => {

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ErrorHandler("User already exists", 400);
    }

    let avatar = {
        public_id: "",
        url: ""
    };

    if (req.file) {

        const result = await uploadOnCloudinary(req.file.path);

        avatar = {
            public_id: result.public_id,
            url: result.url
        };

        fs.unlinkSync(req.file.path);
    }

    const user = await User.create({
        name,
        email,
        password,
        avatar
    });

    return user;
};


export const login = async ({ email, password }) => {

    if (!email || !password)
        throw new ErrorHandler("Email and Password required",400);

    const user = await User.findOne({ email }).select("+password");

    if (!user)
        throw new ErrorHandler("Invalid credentials",401);

    const matched = await user.comparePassword(password);

    if (!matched)
        throw new ErrorHandler("Invalid credentials",401);

    return user;
};


export const logout = (res) => {

    res.cookie("token", null, {

        expires: new Date(Date.now()),
        httpOnly: true

    });

    res.status(200).json({

        success:true,
        message:"Logged out"

    });

};

export const forgotPassword = async (req) => {

    const user = await User.findOne({

        email:req.body.email

    });

    if(!user)
        throw new ErrorHandler("User not found",404);

    const resetToken = user.getResetPasswordToken();

    await user.save({

        validateBeforeSave:false

    });

    const resetUrl =
`${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

    await sendEmail({

        email:user.email,
        subject:"Password Reset",
        message:`Reset Password:\n${resetUrl}`

    });

};


export const resetPassword = async (req)=>{

    const token = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({

        resetPasswordToken:token,

        resetPasswordExpire:{
            $gt:Date.now()
        }

    });

    if(!user)
        throw new ErrorHandler("Token expired",400);

    if(req.body.password!==req.body.confirmPassword)
        throw new ErrorHandler("Passwords don't match",400);

    user.password=req.body.password;

    user.resetPasswordToken=undefined;

    user.resetPasswordExpire=undefined;

    await user.save();

    return user;

}


export const getProfile = async(id)=>{

    const user=await User.findById(id);

    if(!user)
        throw new ErrorHandler("User not found",404);

    return user;

}


export const updatePassword = async(req)=>{

    const user=await User.findById(req.user.id).select("+password");

    const matched=await user.comparePassword(req.body.oldPassword);

    if(!matched)
        throw new ErrorHandler("Old password incorrect",401);

    user.password=req.body.newPassword;

    await user.save();

    return user;

}


export const updateProfile = async(req)=>{

    const user=await User.findById(req.user.id);

    if(!user)
        throw new ErrorHandler("User not found",404);

    user.name=req.body.name;

    user.email=req.body.email;

    if(req.file){

        const result=await uploadOnCloudinary(req.file.path);

        user.avatar={

            public_id:result.public_id,

            url:result.url

        };

        fs.unlinkSync(req.file.path);

    }

    await user.save();

    return user;

}