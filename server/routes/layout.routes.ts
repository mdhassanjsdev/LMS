import { Router } from "express"
import { authorizeRole, isAuthenticated } from "../middleware/auth"
import { createLayout, editlayout, getLayoutByType } from "../controller/layout/layout.controller"

const layout = Router()


layout
    .post('/create-layout', isAuthenticated, authorizeRole('admin'), createLayout)
    .put('/update-layout', isAuthenticated, authorizeRole('admin'), editlayout)
    .get('/get-layout/:type', getLayoutByType)


export default layout