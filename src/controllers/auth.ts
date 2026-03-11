import type { NextFunction, Request, Response } from "express";

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    res.send("login");
};
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    res.send("Register");
};
export const me = async (req: Request, res: Response, next: NextFunction) => {
    res.send("me");
};
