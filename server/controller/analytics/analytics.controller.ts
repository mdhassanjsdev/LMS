import { NextFunction, Request, Response } from "express"
import { catchAsyncError } from "../../error/CatchAsyncError"
import userModel from "../../models/user.model"
import { generateLast12MonthData } from "../../utils/analyticsGenerator"
import { ErrorHandler } from "../../utils/ErrorHandler"
import CourseModel from "../../models/course.model"
import OrderModel from "../../models/oders.model"

export const getUsersAnalytics = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const users = await generateLast12MonthData(userModel)

        res.status(200).json({
            status: 200,
            users,
            msg: 'ok'
        })

    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
})


export const getCoursesAnalytics = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const courses = await generateLast12MonthData(CourseModel)

        res.status(200).json({
            status: 200,
            courses,
            msg: 'ok'
        })

    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
})

export const getOrderAnalytics = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const orders = await generateLast12MonthData(OrderModel)

        res.status(200).json({
            status: 200,
            orders,
            msg: 'ok'
        })

    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
})

