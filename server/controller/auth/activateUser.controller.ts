require('dotenv').config();
import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../../error/CatchAsyncError";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { IActivationRequest } from "../../types";
import userModel, { IUser } from "../../models/user.model";
import jwt from 'jsonwebtoken'

interface activateUser {
    user: IUser,
    activationCode: string
}

export const activationUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { activation_Token, activation_Code } = req.body as IActivationRequest;



        const newUser: activateUser = jwt.verify(activation_Token, process.env.ACTIVATION_SECRET_KEY) as activateUser;
        
        
        if (newUser.activationCode !== activation_Code) {
            return next(new ErrorHandler('Invalid Activation code', 400))
        }

        const { name, email, password } = newUser.user

        const existUser = await userModel.findOne({ email })

        if (existUser) {
            return next(new ErrorHandler('Email already exist', 400))
        }

        await userModel.create({
            name, email, password
        });

        res.status(201).json({
            success: true
        })


    } catch (err: any) {
        return next(new ErrorHandler(err.message, 400))
    }
})