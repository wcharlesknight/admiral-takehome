import React from "react";
import { User } from "../types";

export const AuthContext = React.createContext<{
  user: User | undefined;
  authorize: (user: User) => void;
  deauthroize: () => void;
}>({
  user: undefined,
  authorize: () => {},
  deauthroize: () => {},
});
