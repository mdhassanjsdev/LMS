import { Router } from "express";
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { createOrder, getAllOrders } from "../controller/order/order.controller";




const order = Router()

order
    .post('/create-order', isAuthenticated, createOrder)
    .get('/getall-orders', isAuthenticated, authorizeRole('admin'), getAllOrders)


export default order