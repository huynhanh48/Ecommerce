import { z } from "zod";

export const UpdateUserRoleSchema = z.object({
    role: z.enum(["USER", "ADMIN"])
});

export const UpdateOrderStatusSchema = z.object({
    status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"])
});

export const OrderFilterSchema = z.object({
    status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional()
});

export const ManagementSearchSchema = z.object({
    q: z.string().min(1, "Query string is required"),
    skip: z.preprocess((value) => Number(value), z.number().int().nonnegative().optional()),
    take: z.preprocess((value) => Number(value), z.number().int().positive().optional())
});
