import { IsEnum, IsNotEmpty, IsString } from "class-validator";

import { Template } from "../enums/template.enum";

export class SendEmailDto {
    @IsNotEmpty()
    @IsString()
    from: string;

    @IsNotEmpty()
    @IsString()
    subjectEmail: string;

    @IsNotEmpty()
    @IsString()
    sendTo: string;

    @IsEnum(Template)
    @IsNotEmpty()
    template: string;
}
