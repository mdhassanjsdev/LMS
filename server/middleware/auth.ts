import { NextFunction, Response } from "express";
import { catchAsyncError } from "../error/CatchAsyncError";
import { ErrorHandler } from "../utils/ErrorHandler";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { redis } from "../db/redis";

export const isAuthenticated = catchAsyncError(async (req: any, res: Response, next: NextFunction) => {
    const access_token = req.cookies.acess_token;

    if (!access_token) {
        return next(new ErrorHandler('Please login to access to resource', 401))
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload

    if (!decoded) {
        return next(new ErrorHandler(' access token is not valid', 403))
    }

    const user = await redis.get(decoded.id)

    if (!user) {
        return next(new ErrorHandler('Please login to access to resource', 404))
    }

    req.user = JSON.parse(user);

    next()

})


export const authorizeRole = (...roles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role || '')) {
            return next(new ErrorHandler(`Role ${req.user?.role} is not allowed to access this resource`, 403))
        }

        next()
    }
}