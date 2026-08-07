import asyncHandler from "../utils/asyncHandler.js";
import sendToken from "../utils/jwtToken.js";
import * as authService from "../services/auth.service.js";

export const registerUser = asyncHandler(async (req, res) => {

    const user = await authService.register(req);

    sendToken(user, 201, res);

});

export const loginUser = asyncHandler(async (req, res) => {

    const user = await authService.login(req.body);

    sendToken(user, 200, res);

});

export const logoutUser = asyncHandler(async (req, res) => {

    authService.logout(res);

});

export const forgotPassword = asyncHandler(async (req, res) => {

    await authService.forgotPassword(req);

    res.status(200).json({
        success: true,
        message: "Password reset email sent"
    });

});

export const resetPassword = asyncHandler(async (req, res) => {

    const user = await authService.resetPassword(req);

    sendToken(user, 200, res);

});

export const getUserProfile = asyncHandler(async (req, res) => {

    const user = await authService.getProfile(req.user.id);

    res.status(200).json({
        success: true,
        user
    });

});

export const updatePassword = asyncHandler(async (req, res) => {

    const user = await authService.updatePassword(req);

    sendToken(user, 200, res);

});

export const updateProfile = asyncHandler(async (req, res) => {

    const user = await authService.updateProfile(req);

    res.status(200).json({
        success: true,
        user
    });

});