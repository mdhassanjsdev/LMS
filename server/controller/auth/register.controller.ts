import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../../error/CatchAsyncError";
import { ErrorHandler } from "../../utils/ErrorHandler";
import userModel from "../../models/user.model";
import { IRegisterationBody } from "../../types";
import { createActivationToken } from "../../utils/jwt";
import sendMail from "../../utils/sendMail";


export const registerUserController = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { name, email, password } = req.body;

        console.log(req.body);
        

        const isEmailExist = await userModel.findOne({ email })

        if (isEmailExist) {
            return next(new ErrorHandler('Email already exist', 400))
        }

        const user: IRegisterationBody = {
            name,
            email,
            password
        }

        const activationToken = createActivationToken(user)

        const activationCode = activationToken.activationCode;

        const data = { user: { name: user.name }, activationCode };


        try {
            await sendMail({
                email: user.email,
                subject: 'Activate your account',
                template: "activation-mail.ejs",
                data,
            })

            res.status(201).json({
                success: true,
                message: `Please  check you email: ${user.email} to activate your account!`,
                activationToken: activationToken.token
            })

        } catch (err: any) {
            return next(new ErrorHandler(err.message, 400))
        }


    } catch (err: any) {
        return next(new ErrorHandler(err, 400))
    }
})