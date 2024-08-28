import { response } from "express";
import usersService from "../service/users-service";
import jwt from "jsonwebtoken";

const register = async (req, res, next) => {
  try {
    const result = await usersService.register(req.body);
    res.status(201).json({
      status: "true",
      message: "Success register account",
      results: result,
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const request = req.body;
    const id = request.id;
    const email = request.email;
    const password = request.password;
    const accessToken = jwt.sign(
      { id, email, password },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      { id, email, password },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    await usersService.login(request, refreshToken);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: "true",
      message: "Success login account",
      result: {
        token: accessToken,
        user,
      },
    });
  } catch (e) {
    next(e);
  }
};
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.sendStatus(204);
      return;
    }
    const user = await prismaClient.user.findFirst({
      where: {
        token: refreshToken,
      },
    });
    if (!user) {
      res.sendStatus(204);
      return;
    }
    await usersService.logout(user.id);
    res.clearCookie("refreshToken");
    res.status(200).json({
      status: "true",
      message: "Success logout account",
    });
  } catch (e) {
    return next(e);
  }
};

export default { register, login, logout };
