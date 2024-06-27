import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Heading, Stack } from "@chakra-ui/react";
import { UserStep } from "../components/UserStep";
import { CompanyStep } from "../components/CompanyStep";
import { ShareholdersStep } from "../components/ShareholdersStep";
import { DoneStep } from "../components/DoneStep";
import { ShareholderGrantsStep } from "../components/ShareholderGrantsStep";
import { OnboardingContext } from "../context/OnboardingContext";
import { signupReducer } from "../reducers/SignupReducer";

export function Onboarding() {
  const [state, dispatch] = React.useReducer(signupReducer, {
    userName: "",
    email: "",
    companyName: "",
    shareholders: {},
    grants: {},
  });
  return (
    <OnboardingContext.Provider value={{ ...state, dispatch }}>
      <Stack direction="column" alignItems="center" spacing="10">
        <Heading size="2x1" color="teal.400">
          Lets get started.
        </Heading>
        <Routes>
          <Route path="/" element={<Navigate to="user" replace={true} />} />
          <Route path="user" element={<UserStep />} />
          <Route path="company" element={<CompanyStep />} />
          <Route path="shareholders" element={<ShareholdersStep />} />
          <Route
            path="grants"
            element={<Navigate to={`/start/grants/0`} replace={true} />}
          />
          <Route
            path="grants/:shareholderID"
            element={<ShareholderGrantsStep />}
          />
          <Route path="done" element={<DoneStep />} />
        </Routes>
      </Stack>
    </OnboardingContext.Provider>
  );
}
