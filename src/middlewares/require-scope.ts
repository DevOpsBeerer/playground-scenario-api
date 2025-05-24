import { NextFunction, Request, Response } from "express";
import Error from "../models/error.js";
import { ForbiddenResponse, UnauthorizedResponse } from "../utils.js";

const requireScope = (scopeName?: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.authInfo) {
            const error: Error = UnauthorizedResponse();
            res.status(error.code).json(error);
            return;
        }

        if (!scopeName) {
            next();
            return;
        }

        const scopeString = req.authInfo.scp || req.authInfo.scope || '';
        const scopes = typeof scopeString === 'string' ? scopeString.split(' ') : [];

        if (!scopes.includes(scopeName)) {
            const error: Error = ForbiddenResponse();
            res.status(error.code).json(error);
            return;
        }

        next();
    };
};



export default requireScope;