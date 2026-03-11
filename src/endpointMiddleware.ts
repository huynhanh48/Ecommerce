import type { NextFunction, Request, Response, ErrorRequestHandler } from "express";
import type { HttpException } from "./exceptions/root";

export const endpointMiddleware: ErrorRequestHandler = (error, req, res, next) => {
    const status = error.status || 500;
    res.status(status).json({
        message: error.message || "Internal Server Error",
        code: error.errorCode || 5000,
        errors: error.errors || null,
    });
};