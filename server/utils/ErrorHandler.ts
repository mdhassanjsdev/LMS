export class ErrorHandler extends Error {
    status: number

    constructor(message: any, status: number) {
        super(message)
        this.status = status;

        Error.captureStackTrace(this, this.constructor)
    }

}