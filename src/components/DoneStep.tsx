import React from "react";
import {
  useNavigate,
} from "react-router-dom";
import {
  Text,
  Stack,
  Spinner,
} from "@chakra-ui/react";
import { useContext } from "react";
import { Company, Grant, Shareholder, User } from "../types";
import { useMutation, useQueryClient } from "react-query";
import { OnboardingContext } from "../context/OnboardingContext";
import { AuthContext } from "../context/AuthContext";

export function DoneStep() {
  const { authorize } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { email, userName, companyName, shareholders, grants } =
    useContext(OnboardingContext);

  const grantMutation = useMutation<Grant, unknown, Grant>((grant) =>
    fetch("/grant/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant }),
    }).then((res) => res.json())
  );
  const shareholderMutation = useMutation<Shareholder, unknown, Shareholder>(
    (shareholder) =>
      fetch("/shareholder/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shareholder),
      }).then((res) => res.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user");
      },
    }
  );
  const userMutation = useMutation<User, unknown, User>((user) =>
    fetch("/user/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    }).then((res) => res.json())
  );

  const companyMutation = useMutation<Company, unknown, Company>((company) =>
    fetch("/company/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(company),
    }).then((res) => res.json())
  );

  React.useEffect(() => {
    async function saveData() {
      // This only runs twice in React.StrictMode dev environment, it may cause 
      // an error that can be worked through.
      const user = await userMutation.mutateAsync({ email, name: userName });
      console.log("shareholders:", shareholders, "grants:", grants, "companyName:", companyName)
      await Promise.all([
        ...Object.values(grants).map((grant) =>
          grantMutation.mutateAsync(grant)
        ),
        ...Object.values(shareholders).map((shareholder) =>
          shareholderMutation.mutateAsync(shareholder)
        ),
        companyMutation.mutateAsync({ name: companyName }),
      ]);

      if (user) {
        authorize(user);
        navigate("/dashboard");
      } else {
        // Something bad happened
      }
    }

    saveData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack alignItems="center">
      <Spinner />
      <Text color="teal.400">...Wrapping up</Text>
    </Stack>
  );
}