
import { authClient } from "@/lib/auth-client";
import { LoginValues, RegisterValues } from "../schemas";

export const authService = {
  signIn: async (values: LoginValues) => {
    return await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
  },
  signUp: async (values: RegisterValues) => {
    return await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
    });
  },
  getSession: async () => {
    return await authClient.getSession();
  }
};
