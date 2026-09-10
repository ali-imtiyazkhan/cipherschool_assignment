import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(token as string, "secret");

        next();

    } catch (error) {

        return res.status(401).json({
            error: "Unauthorized"
        });

    }
};