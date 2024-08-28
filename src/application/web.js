import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { authRouter } from "../routes/auth-api.js";

dotenv.config();
export const web = express();
web.use(cors({ credentials: true, origin: "http://localhost:5173" }));
web.use(cookieParser());
web.use(express.json());
web.use(authRouter);
web.use(errorMiddleware);
