import type { Request, RequestHandler, Response, NextFunction } from "express";
import { ZodError } from "zod";
import type { HttpException } from "~/exceptions/root";
import { UnprocessibilityException } from "~/exceptions/unprocessibility";

export const errorHandle = (method: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await method(req, res, next);
        } catch (error) {
            let instance: HttpException;
            if (error instanceof ZodError) {
                instance = new UnprocessibilityException("internal server error", error?.issues);
            } else {
                instance = error as HttpException;
            }
            next(instance);
        }
    }
}