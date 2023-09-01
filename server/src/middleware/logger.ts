import express from "express";

export const logger = (name: string, exclude: string[] = []) => {
    const handler: express.RequestHandler = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        if (!exclude.includes(req.path)) console.info(name + ":", req.method, req.path);
        next();
    };
    return handler;
};
