import { HttpErrorCode, HttpException, ServerErrorCode } from "./root";

class UnprocessibilityException extends HttpException {
    constructor(message: string, errors?: any) {
        super(message, HttpErrorCode.InternalServerError, ServerErrorCode.UNPROCESSIBILITY, errors);
    }
}

export { UnprocessibilityException };