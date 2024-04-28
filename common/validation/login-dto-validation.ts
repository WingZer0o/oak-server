import { passwordRegex, userNameRegex } from "./regex.ts";

export const loginUserDtoValidation = (email: string, password: string) => {
    let result = new LoginUserDtoValidation();
    result.isValid = true;
    if (!userNameRegex.test(email)) {
        result.isValid = false;
        result.message = "Username is not valid" // TODO: better error message.
    }
    else if (!passwordRegex.test(password)) {
        result.isValid = false;
        result.message = "Password is not valid" // TODO: better error message.
    }
    return result;
}

export class LoginUserDtoValidation {
    public isValid!: boolean;
    public message!: string;
}