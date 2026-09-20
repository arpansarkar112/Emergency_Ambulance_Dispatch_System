import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma";
import config from "../config";
import { Role } from "../../generated/prisma/client";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (userId: number, role: Role) => {
  const accessToken = jwt.sign({ userId, role }, config.jwt_access_secret as string, { expiresIn: config.jwt_access_expires_in });
  const refreshToken = jwt.sign({ userId, role }, config.jwt_refresh_secret as string, { expiresIn: config.jwt_refresh_expires_in });
  return { accessToken, refreshToken };
};

export const registerUser = async (data: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw Object.assign(new Error("Email already in use"), { statusCode: 400 });

  const hashedPassword = await bcrypt.hash(data.password, Number(config.bcrypt_salt_rounds));

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: data.role,
      profile: {
        create: {
          firstName: data.firstName,
          lastName: data.lastName,
        }
      }
    },
    select: { id: true, email: true, role: true, profile: true }
  });

  return user;
};

export const loginUser = async (data: any) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const tokens = generateTokens(user.id, user.role);
  return { user: { id: user.id, email: user.email, role: user.role }, ...tokens };
};

export const socialLogin = async (idToken: string) => {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw Object.assign(new Error("Invalid Google ID token"), { statusCode: 401 });
  }

  if (!payload || !payload.email) {
    throw Object.assign(new Error("Could not retrieve email from token"), { statusCode: 400 });
  }

  const { email, given_name, family_name } = payload;
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: "", // No password for social login
        isVerified: true,
        profile: {
          create: {
            firstName: given_name,
            lastName: family_name,
          }
        }
      }
    });
  }

  const tokens = generateTokens(user.id, user.role);
  return { user: { id: user.id, email: user.email, role: user.role }, ...tokens };
};
