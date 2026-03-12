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
