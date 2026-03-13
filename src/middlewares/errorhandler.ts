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
                const issues = error.issues;
                const passwordIssue = issues.find((issue) => {
                    const path = issue.path;
                    return (
                        issue.code === "invalid_format" &&
                        Array.isArray(path) &&
                        path[0] === "password"
                    );
                });

                const message = passwordIssue
                    ? "Invalid password format: must contain at least one lowercase and one uppercase letter"
                    : "internal server error";

                instance = new UnprocessibilityException(message, issues);
            } else {
                instance = error as HttpException;
            }
            next(instance);
        }
    }
}