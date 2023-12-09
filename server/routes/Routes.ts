import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./users.routes";
import CourseRouter from "./course.routes";
import layout from "./layout.routes";
import notifications from "./notification.routes";
import order from "./order.routes";
import analytics from "./analytics.routes";

const MainRouter = Router()

export default MainRouter.use([
    authRouter,
    userRouter,
    CourseRouter,
    layout,
    notifications,
    order,
    analytics
])