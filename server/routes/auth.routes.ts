import { Router } from "express";
import { registerUserController } from "../controller/auth/register.controller";
import { activationUser } from "../controller/auth/activateUser.controller";
import { loginController } from "../controller/auth/login.controller";
import { logOutController } from "../controller/auth/logout.controller";
import { isAuthenticated } from "../middleware/auth";
import { updateAccessToken } from "../controller/auth/updateAccessToken.controller";
import socialAuthController from "../controller/auth/socialAuth";

const authRouter = Router()

authRouter
    .post('/register', registerUserController)
    .post('/activate-user', activationUser)
    .post('/login', loginController)
    .get('/logout', isAuthenticated, logOutController)
    .get('/refreshtoken', updateAccessToken)
    .post('/socialAuth', socialAuthController)

export default authRouter;