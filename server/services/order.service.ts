import { Response } from "express";
import OrderModel from "../models/oders.model";
import { catchAsyncError } from "../error/CatchAsyncError";

//new order
export const newOrder = catchAsyncError(async (data: any, res: Response) => {
    const order = await OrderModel.create(data);
    res.status(201).json({
        success: true,
        order,
    });
});

//get orders
export const getAllOrdersService = async (res: Response) => {
    const orders = await OrderModel.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        orders,
    });
};