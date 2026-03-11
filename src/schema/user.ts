import z from "zod";

export const UserSchema = z.object({
    name: z.string().min(2).max(50),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z]).+$/), // Minimum length of 8 characters for password and  Contains both uppercase and lowercase letters.
    email: z.string().email(),
});

export const MetaDataSchema = z.object({
    tel: z.string().min(10).max(15).regex(/^(84|0)\d{9,10}$/), // regex for phone number of Vietnam (84xxxxxxxxxx or 0xxxxxxxxx)
    age: z.number().int().min(0).max(120),
});

export const ResetPasswordSchema = z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z]).+$/),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const ResetPasswordTokenSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z]).+$/),
});