import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../../error/CatchAsyncError";
import { IOrder } from "../../models/oders.model";
import userModel from "../../models/user.model";
import { ErrorHandler } from "../../utils/ErrorHandler";
import CourseModel from "../../models/course.model";
import path from "path";
import ejs from 'ejs';
import sendMail from "../../utils/sendMail";
import NotificationModel from "../../models/notification.model";
import { getAllOrdersService, newOrder } from "../../services/order.service";

//create order
export const createOrder = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { courseId, paymentInfo } = req.body as IOrder;

            const user = await userModel.findById(req.user?._id);
            const courseAlreadyExist = user?.courses.some(
                (course: any) => course.courseId === courseId
            );

            if (courseAlreadyExist) {
                return next(
                    new ErrorHandler("You have already purchase this course", 400)
                );
            }

            const course = await CourseModel.findById(courseId);
            if (!course) {
                return next(new ErrorHandler("Course not found", 404));
            }

            const data: any = {
                courseId: course?._id,
                userId: user?._id,
                paymentInfo,
            };

            const mailData = {
                order: {
                    _id: course._id.toString().slice(0, 6),
                    name: course.name,
                    price: course.price,
                    date: new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    }),
                },
            };

            await ejs.renderFile(
                path.join(__dirname, "../mails/order-confirmation.ejs"),
                { order: mailData }
            );

            try {
                if (user) {
                    await sendMail({
                        email: user.email,
                        subject: "Order confirmation",
                        template: "order-confirmation.ejs",
                        data: mailData,
                    });
                }
            } catch (error: any) {
                return next(new ErrorHandler(error.message, 500));
            }

            user?.courses.push({ courseId: course?._id });

            user?.save();
            await NotificationModel.create({
                userId: user?._id,
                title: "New order",
                message: `You have a new order from ${course.name}`,
            });

            course.purchased ? course.purchased += 1 : course.purchased


            await course?.save();

            newOrder(data, res, next);

        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);


// get all orders - (only admin)
export const getAllOrders = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            getAllOrdersService(res);
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);
