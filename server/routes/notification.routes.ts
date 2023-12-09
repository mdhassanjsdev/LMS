import { Router } from "express";
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { getNotifications, updateNotification } from "../controller/notification/notification.controller";


const notifications = Router()

notifications
    .get('/get-all-notefications', isAuthenticated, authorizeRole('admin'), getNotifications)
    .put('/update-notefications/:id', isAuthenticated, authorizeRole('admin'), updateNotification)


export default notifications