import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets.js";
import { prisma } from "../lib/prisma.js";
import { HttpException, HttpErrorCode, ServerErrorCode } from "../exceptions/root.js";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next(new HttpException("Unauthorized - Missing Token", HttpErrorCode.Unauthorized));
        }

        const token = authHeader.split("Bearer ")[1];
        if (!token) {
            return next(new HttpException("Unauthorized - Invalid Token format", HttpErrorCode.Unauthorized));
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

        const user = await prisma.user.findFirst({ where: { id: decoded.userId } });
        if (!user) {
            return next(new HttpException("Unauthorized - User not found", HttpErrorCode.Unauthorized, ServerErrorCode.USER_NOT_FOUND));
        }

        req.user = user;
        next();
    } catch (error) {
        next(new HttpException("Unauthorized - Invalid Token", HttpErrorCode.Unauthorized));
    }
};

export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next();
        }

        const token = authHeader.split("Bearer ")[1];
        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await prisma.user.findFirst({ where: { id: decoded.userId } });

        if (user) {
            req.user = user;
        }

        next();
    } catch (error) {
        // Nếu token không hợp lệ thì ignore để xử lý guest order
        next();
    }
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user && user.role === 'ADMIN') {
        next();
    } else {
        next(new HttpException("Forbidden - Admin access required", HttpErrorCode.Forbidden));
    }
};