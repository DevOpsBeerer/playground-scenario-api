import Error from "./models/error.js";

function BadRequestResponse(): Error {
    const code: number = 400;
    const message: string = "The request could not be processed due to invalid syntax or parameters";

    return { code, message } as Error;
}

function NotFoundResponse(): Error {
    const code: number = 404;
    const message: string = "The requested resource could not be found";

    return { code, message } as Error;
}

function UnauthorizedResponse(): Error {
    const code: number = 401;
    const message: string = "Authentication is required to access this resource";

    return { code, message } as Error;
}

function ForbiddenResponse(): Error {
    const code: number = 403;
    const message: string = "You don't have permission to access this resource";

    return { code, message } as Error;
}

export {
    BadRequestResponse, ForbiddenResponse, NotFoundResponse,
    UnauthorizedResponse
};
