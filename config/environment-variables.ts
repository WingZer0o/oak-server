// Import the load.ts module to auto-import from the .env file and into the process environment.
import "https://deno.land/std@0.223.0/dotenv/load.ts";

export default class EnvironmentVariables {
    private static instance: UserDefinedEnvironmentVariables;

    constructor() {
        if (EnvironmentVariables.instance) {
            throw new Error("Error - use EnvironmentVariables.getInstance()");
        }
        this.member = 0;
    }

    static getInstance(): UserDefinedEnvironmentVariables {
        EnvironmentVariables.instance = EnvironmentVariables.instance || new UserDefinedEnvironmentVariables();
        return EnvironmentVariables.instance;
    }

    member: number;
}


class UserDefinedEnvironmentVariables {
  public postgresDatabase: string | undefined;

  constructor() {
    this.postgresDatabase = Deno.env.get("POSTGRES_URL");
  }
}
