import { NextFunction, Request, Response } from "express"
import { ErrorHandler } from "../utils/ErrorHandler"


export const errohandle = (err:any, req: Request, res: Response, next: NextFunction) => {
  err.status = err.status || 500
  err.message = err.message || "Internal server error"

  if (err.name  === "CastError") {
    const message = `Resourses not found . Invalid ${err.path}`
    err = new ErrorHandler(message, 400)
  }

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400)
  }

  if (err.name === "JsonWebTokenError") {
        const message = `Json Web token is invalid, try again`
        err = new ErrorHandler(message, 400)
  }

  if(err.name === 'TokenExpiredError'){
    const message = `Json web token is expired. try again`;
    err  = new ErrorHandler(message, 400)
  }

  res.status(err.status).json({
    status:err.status,
    success:false,
    message : err.message
  })
}