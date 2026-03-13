import type { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpException, HttpErrorCode, ServerErrorCode } from "../exceptions/root.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets.js";
import { MetaDataSchema, UserSchema, ResetPasswordSchema, ForgotPasswordSchema, ResetPasswordTokenSchema } from "~/schema/user.js";

export const login: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {

    const { email, password } = req.body;

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
        return next(new HttpException("User not found", HttpErrorCode.NotFound, ServerErrorCode.USER_NOT_FOUND));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new HttpException("Invalid credentials", HttpErrorCode.Unauthorized, ServerErrorCode.INVALID_CREDENTIALS));
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
        message: "Login successful",
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
};

export const register: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {

    const { email, password, name } = UserSchema.parse(req.body);

    let user = await prisma.user.findFirst({ where: { email } });
    if (user) {
        return next(new HttpException("User already exists", HttpErrorCode.BadRequest, ServerErrorCode.USER_ALREADY_EXISTS));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await prisma.user.create({
        data: { email, password: hashedPassword, name }
    });

    res.status(201).json({
        message: "Register successful",
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
};

export const me: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    res.json(req.user);
};

export const getUserWithMeta: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number((req as any).user?.id);
    if (!userId) {
        return next(new HttpException("Unauthorized", HttpErrorCode.Unauthorized));
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {

            metaData: {
                include: {
                    address: true
                }
            }
        }
    });

    if (!user) {
        return next(new HttpException("User not found", HttpErrorCode.NotFound, ServerErrorCode.USER_NOT_FOUND));
    }

    res.status(200).json({
        message: "Get user with metadata and address successful",
        data: user
    });
};

export const addMetaData: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { name, tel, age, gender } = MetaDataSchema.parse(req.body);

    const user = await prisma.user.findFirst({ where: { id: req.user.id } });
    if (!user) {
        return next(new HttpException("User not found", HttpErrorCode.NotFound, ServerErrorCode.USER_NOT_FOUND));
    }

    let genderBool: boolean | undefined;
    if (typeof gender === "boolean") {
        genderBool = gender;
    } else if (gender === "Male") {
        genderBool = true;
    } else if (gender === "Female") {
        genderBool = false;
    }

    if (name && name !== user.name) {
        await prisma.user.update({ where: { id: req.user.id }, data: { name } });
    }

    const createData: any = {
        tel,
        age,
        userId: Number(req.user.id),
    };
    if (genderBool !== undefined) {
        createData.gender = genderBool;
    }

    const newMetaData = await prisma.metaData.upsert({
        where: { userId: Number(req.user.id) },
        update: createData,
        create: createData,
    });

    res.status(201).json({
        message: "Add metadata successful",
        data: newMetaData,
    });
};

export const updateMetaData: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { name, tel, age, gender } = MetaDataSchema.parse(req.body);

    const metaData = await prisma.metaData.findFirst({ where: { userId: req.user.id } });
    if (!metaData) {
        return next(new HttpException("MetaData not found", HttpErrorCode.NotFound));
    }

    let genderBool: boolean | undefined;
    if (typeof gender === "boolean") {
        genderBool = gender;
    } else if (gender === "Male") {
        genderBool = true;
    } else if (gender === "Female") {
        genderBool = false;
    }

    const dataToUpdate: any = { tel, age };
    if (genderBool !== undefined) {
        dataToUpdate.gender = genderBool;
    }

    if (name) {
        await prisma.user.update({ where: { id: req.user.id }, data: { name } });
    }

    const updatedMetaData = await prisma.metaData.update({
        where: { userId: req.user.id },
        data: dataToUpdate,
    });

    res.status(200).json({
        message: "Update metadata successful",
        data: updatedMetaData,
    });
};

export const addAddress: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const id = Number(req.params.id);
    const { lineone, linetwo, province, district } = req.body;

    const user = await prisma.user.findFirst({ where: { id: req.user.id }, include: { metaData: true } });
    if (!user) {
        return next(new HttpException("User not found", HttpErrorCode.NotFound, ServerErrorCode.USER_NOT_FOUND));
    }
    if (user.metaData === null) {
        return next(new HttpException("MetaData not found", HttpErrorCode.NotFound, ServerErrorCode.METADATA_NOT_FOUND));
    }
    const newAddress = await prisma.address.create({
        data: {
            lineone,
            linetwo,
            province,
            district,
            metaDataId: user.metaData.id,
        },
    });

    res.status(201).json({
        message: "Add address successful",
        data: newAddress,
    });
};

export const updateAddress: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const id = Number(req.params.id);
    const { lineone, linetwo, province, district } = req.body;

    const address = await prisma.address.findFirst({ where: { id } });
    if (!address) {
        return next(new HttpException("Address not found", HttpErrorCode.NotFound));
    }

    const updatedAddress = await prisma.address.update({
        where: { id },
        data: { lineone, linetwo, province, district },
    });

    res.status(200).json({
        message: "Update address successful",
        data: updatedAddress,
    });
};

export const deleteAddress: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const id = Number(req.params.id);

    const address = await prisma.address.findFirst({ where: { id } });
    if (!address) {
        return next(new HttpException("Address not found", HttpErrorCode.NotFound));
    }

    await prisma.address.delete({ where: { id } });

    res.status(200).json({
        message: "Delete address successful",
    });
};

export const getMetaData: RequestHandler = async (
    req: any,
    res: Response,
    next: NextFunction,
) => {
    const metaData = await prisma.metaData.findFirst({ where: { userId: Number(req.user.id) }, include: { address: true } });
    if (!metaData) {
        return next(new HttpException("MetaData not found", HttpErrorCode.NotFound, ServerErrorCode.METADATA_NOT_FOUND));
    }

    res.status(200).json({
        message: "Get metadata successful",
        data: metaData,
    });
};

export const getAddress: RequestHandler = async (
    req: any,
    res: Response,
    next: NextFunction,
) => {
    const metaData = await prisma.metaData.findFirst({ where: { userId: Number(req.user.id) } });
    if (!metaData) {
        return next(new HttpException("MetaData not found", HttpErrorCode.NotFound, ServerErrorCode.METADATA_NOT_FOUND));
    }

    const addresses = await prisma.address.findMany({ where: { metaDataId: metaData.id } });

    res.status(200).json({
        message: "Get addresses successful",
        data: addresses,
    });
};

export const changePassword: RequestHandler = async (
    req: any,
    res: Response,
    next: NextFunction,
) => {
    const { oldPassword, newPassword } = ResetPasswordSchema.parse(req.body);

    const user = await prisma.user.findFirst({ where: { id: Number(req.user.id) } });
    if (!user) {
        return next(new HttpException("User not found", HttpErrorCode.NotFound, ServerErrorCode.USER_NOT_FOUND));
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        return next(new HttpException("Invalid credentials", HttpErrorCode.Unauthorized, ServerErrorCode.INVALID_CREDENTIALS));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    });

    res.status(200).json({
        message: "Change password successful",
        user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role }
    });
};

export const forgotPassword: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { email } = ForgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
        return next(new HttpException("User not found", HttpErrorCode.NotFound, ServerErrorCode.USER_NOT_FOUND));
    }

    const secret = JWT_SECRET + user.password;
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '15m' });

    res.status(200).json({
        message: "Forgot password token generated. Please send this token and newPassword to /reset-password-token",
        token
    });
};

export const resetPasswordWithToken: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { token, newPassword } = ResetPasswordTokenSchema.parse(req.body);

    const decoded = jwt.decode(token) as { userId: number } | null;
    if (!decoded || !decoded.userId) {
        return next(new HttpException("Invalid token structure", HttpErrorCode.BadRequest));
    }

    const user = await prisma.user.findFirst({ where: { id: decoded.userId } });
    if (!user) {
        return next(new HttpException("User not found", HttpErrorCode.NotFound, ServerErrorCode.USER_NOT_FOUND));
    }

    const secret = JWT_SECRET + user.password;;
    try {
        jwt.verify(token, secret);
    } catch (error) {
        return next(new HttpException("Invalid or expired token", HttpErrorCode.BadRequest));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    });

    res.status(200).json({
        message: "Reset password successful",
        user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role }
    });
};
