import { HttpException, HttpStatus } from '@nestjs/common';
import { CustomErrorCodes } from 'src/enums';

export class BaseCustomException extends HttpException {
    private readonly defaultMessage: string = 'An error occurred while processing the request. Please try again later or contact the administrator for help.';
    public code: CustomErrorCodes = CustomErrorCodes.BaseCode;
    public data: any;

    constructor(message?: string, statusCode?: HttpStatus, data?: any) {
        const status = statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
        super(message, status);
        const msg = message || this.defaultMessage;
        this.message = msg;
        this.data = data;
    }
}