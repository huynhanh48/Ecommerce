class HttpException extends Error {
    message: string;
    status: number;
    errorCode: ServerErrorCode;
    errors: any;
    constructor(message: string, status: number, errorCode?: any, errors?: any) {
        super(message);
        this.message = message;
        this.status = status;
        this.errorCode = errorCode;
        this.errors = errors;
    }
}

enum HttpErrorCode {
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500,
}
enum ServerErrorCode {
    USER_NOT_FOUND = 1001,
    USER_ALREADY_EXISTS = 1002,
    INVALID_CREDENTIALS = 1003,
    UNPROCESSIBILITY = 1004,
    METADATA_NOT_FOUND = 1005,
}


export { HttpException, HttpErrorCode, ServerErrorCode };