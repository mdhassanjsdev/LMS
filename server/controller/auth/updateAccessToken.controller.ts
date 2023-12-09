require('dotenv').config();
import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../../error/CatchAsyncError";
import { ErrorHandler } from "../../utils/ErrorHandler";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { redis } from "../../db/redis";
import { acessTokenOptions, refreshTokenOptions } from "../../utils/jwt";

export const updateAccessToken = catchAsyncError(async (req: any, res: Response, next: NextFunction) => {
    try {

        const refresh_Token = req.cookies.refresh_token as string;

        const decode = jwt.verify(refresh_Token, process.env.REFRESH_TOKEN as string) as JwtPayload;


        const message = 'Could not refresh token';

        if (!decode) {
            return next(new ErrorHandler(message, 400));
        }

        const session = await redis.get(decode.id as string);

        if (!session) {
            return next(new ErrorHandler('Please login to access to resources', 400));
        }

        const user = JSON.parse(session);

        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
            expiresIn: '5m'
        });

        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
            expiresIn: '3d'
        });

        req.user = user;

        res.cookie('acess_token', accessToken, acessTokenOptions);
        res.cookie('refresh_token', refreshToken, refreshTokenOptions);


        await redis.set(user._id, JSON.stringify(user), 'EX', 604800) // 7 day

        next()

        res.status(200).send('ok')

    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
})