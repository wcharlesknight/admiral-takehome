import React from "react";
import {  OnboardingAction, OnboardingFields } from "../types";

export const OnboardingContext = React.createContext<
  OnboardingFields & { dispatch: React.Dispatch<OnboardingAction> }
>({
  userName: "",
  email: "",
  companyName: "",
  shareholders: {},
  grants: {},
  dispatch: () => {},
});