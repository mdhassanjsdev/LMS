import { Router } from "express"
import { authorizeRole } from "../middleware/auth"
import { getCoursesAnalytics, getOrderAnalytics, getUsersAnalytics } from "../controller/analytics/analytics.controller"

const analytics = Router()

analytics
    .get('/user-analytics', authorizeRole('admin'), getUsersAnalytics)
    .get('/courses-analytics', authorizeRole('admin'), getCoursesAnalytics)
    .get('/orders-analytics', authorizeRole('admin'), getOrderAnalytics)


export default analytics