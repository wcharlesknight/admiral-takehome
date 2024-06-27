import React from "react";
import { useNavigate } from "react-router-dom";
import { Stack, Button, Input, FormControl, FormLabel } from "@chakra-ui/react";
import { useContext } from "react";
import { OnboardingContext } from "../context/OnboardingContext";

export function CompanyStep() {
  const { companyName, dispatch } = useContext(OnboardingContext);
  const navigate = useNavigate();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate("/start/shareholders");
  }

  return (
    <Stack as="form" onSubmit={onSubmit} spacing="4">
      <FormControl id="companyName" size="lg" color="teal.400">
        <FormLabel>What company are we examining?</FormLabel>
        <Input
          type="text"
          placeholder={"Company Name"}
          onChange={(e) =>
            dispatch({ type: "updateCompany", payload: e.target.value })
          }
          value={companyName}
        />
      </FormControl>
      <Button type="submit" colorScheme="teal" isDisabled={!companyName.length}>
        Next
      </Button>
    </Stack>
  );
}
