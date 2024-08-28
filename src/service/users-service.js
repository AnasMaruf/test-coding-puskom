import { prismaClient } from "../application/database.js";
import {
  getUserValidation,
  loginUserValidation,
  registerUserValidation,
} from "../validation/users-validation.js";
import { validate } from "../validation/validation.js";
import bcrypt from "bcrypt";

const register = async (request) => {
  const user = validate(registerUserValidation, request);
  const countUser = await prismaClient.user.count({
    where: {
      email: user.email,
    },
  });
  if (countUser === 1) {
    throw new ResponseError(400, "Email already exist");
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(user.password, salt);

  await bcrypt.compare(user.confPassword, hashedPassword);

  delete user.confPassword;

  return prismaClient.user.create({
    data: {
      name: user.name,
      email: user.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
};

const login = async (request, refreshToken) => {
  const loginRequest = validate(loginUserValidation, request);
  const user = await prismaClient.user.findUnique({
    where: {
      email: loginRequest.email,
    },
  });
  if (!user) {
    throw new ResponseError(401, "Email or password wrong");
  }

  const isPasswordValid = await bcrypt.compare(
    loginRequest.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new ResponseError(401, "Email or password wrong");
  }

  // const token = uuid().toString();
  return prismaClient.user.update({
    data: {
      token: refreshToken,
    },
    where: {
      email: user.email,
    },
    select: {
      token: true,
    },
  });
};

const logout = async (id) => {
  id = validate(getUserValidation, id);
  const checkUser = await prismaClient.user.findUnique({
    where: {
      id: id,
    },
  });
  if (!checkUser) {
    throw new ResponseError(404, "User is not found");
  }
  return prismaClient.user.update({
    where: {
      id: id,
    },
    data: {
      token: null,
    },
    select: {
      id: true,
    },
  });
};

export default { register, login, logout };
