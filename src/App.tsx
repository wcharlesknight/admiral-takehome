import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Container } from "@chakra-ui/react";
import { User } from "./types";
import { Home } from "./pages/Home";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Signin } from "./pages/Signin";
import { ShareholderPage } from "./pages/Shareholder";
import { AuthContext } from "./context/AuthContext";

function App() {
  const [user, setUser] = React.useState<User | undefined>(() => {
    try {
      return JSON.parse(localStorage.getItem("session") || "bad json");
    } catch (e) {
      return undefined;
    }
  });

  React.useEffect(() => {
    if (user) {
      localStorage.setItem("session", JSON.stringify(user));
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        authorize: setUser,
        deauthroize: () => setUser(undefined),
      }}
    >
      <Container paddingTop="16" paddingBottom="16">
        <Routes>
          {user ? (
            <>
              <Route
                path="/dashboard"
                element={
                  <Navigate to="/dashboard/investor/amount" replace={true} />
                }
              />
              <Route path="/dashboard/:mode/:view" element={<Dashboard />} />
              <Route
                path="/shareholder/:shareholderID"
                element={<ShareholderPage />}
              />
              <Route path="/*" element={<Navigate to="/dashboard" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/start/*" element={<Onboarding />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </Container>
    </AuthContext.Provider>
  );
}

export default App;
