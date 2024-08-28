import express from "express";
import usersController from "../controller/users-controller";
const authRouter = new express.Router();
authRouter.post("api/register", usersController.register);
authRouter.post("api/login", usersController.login);
export { authRouter };
