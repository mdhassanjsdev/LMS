require('dotenv').config();
import jwt, { Secret } from 'jsonwebtoken'
import { IActivationToken } from '../types'
import { IUser } from '../models/user.model';
import { redis } from '../db/redis'

interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSizes: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString()

    const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET_KEY as Secret, {
        expiresIn: '5m'
    })

    return {
        token,
        activationCode
    }
}


export const acessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10)
export const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10)


export const acessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + acessTokenExpire * 60 * 60 * 1000),
    maxAge: acessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSizes: 'lax',
}

export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    sameSizes: 'lax',
    secure: true
}


export const sendToken = async (user: IUser, statusCode: number, res: any) => {
    const acessToken = await user.signAccessToken();
    const refreshToken = await user.signrefreshToken();



    // upload to redis 

    redis.set(user._id, JSON.stringify(user) as any)


    // parse env variables

    if (process.env.NODE_ENV === 'production') {
        acessTokenOptions.secure = true
    }

    res.cookie('acess_token', acessToken, acessTokenOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenOptions)

    res.status(statusCode).json({
        success: true,
        user,
        acessToken
    })
}
