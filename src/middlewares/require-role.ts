import { NextFunction, Request, Response } from "express";
import Error from "../models/error.js";
import { ForbiddenResponse, UnauthorizedResponse } from "../utils.js";

const requireRole = (roleName?: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.authInfo) {
            const error: Error = UnauthorizedResponse();
            res.status(error.code).json(error);
            return;
        }

        if (!roleName) {
            next();
            return;
        }

        const roles: string[] = req.authInfo.roles || [];

        if (!roles.includes(roleName)) {
            const error: Error = ForbiddenResponse();
            res.status(error.code).json(error);
            return;
        }

        next();
    };
};



export default requireRole;