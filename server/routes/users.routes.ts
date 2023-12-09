import { Router } from "express";
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { deleteUser, getAllUser, getUserInfo, updatePassword, updateUserInfo, updateUserRole } from "../controller/user/user.controller";

const userRouter = Router()


userRouter
    .get('/me', isAuthenticated, getUserInfo)
    .put('/update-profile', isAuthenticated, updateUserInfo)
    .put('/update-password', isAuthenticated, updatePassword)
    // .post('/upload-profile-picture', isAuthenticated, upload.single('avatar'), updateProfilePicture)
    .get('/getall-users', isAuthenticated, authorizeRole('admin'), getAllUser)
    .put('/updateuser-role', isAuthenticated, authorizeRole('admin'), updateUserRole)
    .delete('/delete-user/:id', isAuthenticated, authorizeRole('admin'), deleteUser)



export default userRouter