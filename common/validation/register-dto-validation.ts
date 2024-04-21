import { RegisterDto } from "../../models/user-auth/register-dto.ts";

export const registerDtoValidation = (body: RegisterDto) => {
    let result = new RegisterDtoValidation();
    result.isValid = true;
    const userNameRegex: RegExp = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!userNameRegex.test(body.email)) {
        result.isValid = false;
        result.message = "Username did not meet criteria"; // TOOD more descriptive message.
    } 
    const passwordRegex: RegExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!passwordRegex.test(body.password)) {
        result.isValid = false;
        result.message = "Password did not meet criteria" // TODO more descriptive message.
    }
    return result;
}

export class RegisterDtoValidation {
    public isValid!: boolean;
    public message!: string;
}