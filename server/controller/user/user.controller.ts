import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../../error/CatchAsyncError";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { getAllUsersService, getUserById, updateUserRoleService } from "../../services/user.service";
import { IUpdatePassword, IUpdateUserInfo } from "../../types";
import userModel from "../../models/user.model";
import { redis } from "../../db/redis";



export const getUserInfo = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const userId = req.user?._id;

        getUserById(userId, res)

    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
})




export const updateUserInfo = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { name } = req.body as IUpdateUserInfo

        const userId = req.user?._id

        const user = await userModel.findById(userId)

        if (name && user) {
            user.name = name
        }

        await user?.save()

        await redis.set(userId, JSON.stringify(user))

        res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
})



export const updatePassword = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { oldPassword, newPassword } = req.body as IUpdatePassword

        if (!oldPassword || !newPassword) {
            return next(new ErrorHandler("Please enter currect old and new password", 400))
        }

        const userId = req.user?._id
        const user = await userModel.findById(userId).select('+password')

        if (user.password === undefined) {
            return next(new ErrorHandler('Invalid user', 400))
        }

        const isPasswordMatch = await user?.comparePassword(oldPassword)

        if (!isPasswordMatch) {
            return next(new ErrorHandler('Invalid old password', 400))
        }

        user.password = newPassword;

        await user.save()

        await redis.set(req.user?._id, JSON.stringify(user))

        res.status(201).json({
            status: 201,
            success: true,
            user,
            msg: 'user password successfully updated'
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
})


export const updateProfilePicture = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const userId = req.user._id

        const user = await userModel.findById(userId)



    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
})


// Admin Only

export const getAllUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        getAllUsersService(res)

    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
})


export const updateUserRole = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { id, role } = req.body;

        updateUserRoleService(res, id, role)

    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
})


export const deleteUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;

            const user = await userModel.findById(id)

            if (!user) {
                return next(new ErrorHandler('User not found', 404))
            }

            await user.deleteOne({ id })

            await redis.del(id)

            res.status(200).json({
                status: 200,
                user,
                msg: 'user successfully deleted'
            })


    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
})

