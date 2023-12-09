import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../../error/CatchAsyncError";
import { ErrorHandler } from "../../utils/ErrorHandler";
import userModel from "../../models/user.model";
import { sendToken } from "../../utils/jwt";

interface ILoginRequest {
    email:string;
    password:string;
  }

export const loginController = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { email, password } = req.body as ILoginRequest;

        if (!email || !password) {
            return next(new ErrorHandler('Please enter email or password', 400))
        };

        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return next(new ErrorHandler('Invalid email or Password', 400))
        }

        const isPasswordMatch = await user.comparePassword(password)

        if (!isPasswordMatch) {
            return next(new ErrorHandler('Invalid email or Password', 400))
        }

        await sendToken(user, 200, res)

        res.send(user)

    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
})