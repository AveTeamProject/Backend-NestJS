import { CustomErrorCodes } from "src/enums";
import { BaseCustomException } from "./base-custom-exception";
import { HttpStatus } from "@nestjs/common";

export class ExampleException extends BaseCustomException {
    public code: CustomErrorCodes = CustomErrorCodes.ExampleCode;
    constructor(message?: string, statusCode?: HttpStatus, data?: any) {
        super(message, statusCode, data);
    }
}