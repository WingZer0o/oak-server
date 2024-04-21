export class Base400Response {
    public errorMessage: string;

    constructor(errorMessage: string) {
        this.errorMessage = errorMessage;
    }
}