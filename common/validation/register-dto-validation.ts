import { RegisterDto } from "../../models/user-auth/register-dto.ts";
import { passwordRegex, userNameRegex } from "./regex.ts";

export const registerDtoValidation = (body: RegisterDto) => {
    let result = new RegisterDtoValidation();
    result.isValid = true;
    if (!userNameRegex.test(body.email)) {
        result.isValid = false;
        result.message = "Username did not meet criteria"; // TOOD more descriptive message.
    } 
    else if (!passwordRegex.test(body.password)) {
        result.isValid = false;
        result.message = "Password did not meet criteria" // TODO more descriptive message.
    }
    return result;
}

export class RegisterDtoValidation {
    public isValid!: boolean;
    public message!: string;
}