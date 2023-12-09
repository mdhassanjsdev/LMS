import { NextFunction, Request, Response } from 'express'
import { catchAsyncError } from "../../error/CatchAsyncError"
import { redis } from '../../db/redis'
import { ErrorHandler } from '../../utils/ErrorHandler'

export const logOutController  =  catchAsyncError(async (req:any, res:Response, next:NextFunction) => {
    try {
      res.cookie('acess_token', '', {maxAge:1})
      res.cookie('refresh_token', '', {maxAge:1})
  
      redis.del(req.user?._id)
  
      res.status(200).json({
        success:true,
        message:'Logged out successfully '
      })
    } catch (err) {
      return next(new ErrorHandler(err.message, 400))
    }
  }) 