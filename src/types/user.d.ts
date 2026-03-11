import { User } from "@/models/user";

declare module "express" {
    export interface Request {
        user?: User;
    }
}