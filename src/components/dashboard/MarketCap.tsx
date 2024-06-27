import React, { useCallback } from "react";
import { Text, Stack, Button, Input } from "@chakra-ui/react";
import { CompanyValue, Grant, Query } from "../../types";
import { useMutation, useQueryClient } from "react-query";
import produce from "immer";

type Props = {
  grantData: Query<Grant>;
  valueData: CompanyValue | undefined;
};

export function MarketCap({ grantData, valueData }: Props) {
  const [newCommonValue, setNewCommonValue] = React.useState<string>("");
  const [newPreferredValue, setNewPreferredValue] = React.useState<string>("");
  const queryClient = useQueryClient();
  const valueMutation = useMutation<
    CompanyValue,
    unknown,
    Partial<CompanyValue>
  >(
    (value) =>
      fetch("/value/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      }).then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Failed to update value");
        }
      }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData<CompanyValue | undefined>(
          "value",
          (currentData) => {
            if (currentData) {
              return produce(currentData, (draft: CompanyValue) => {
                if (draft) {
                  draft.commonValue = data.commonValue;
                  draft.preferredValue = data.preferredValue;
                }
              });
            }
          }
        );
      },
    }
  );

  const commonShareValue = Object.values(grantData).reduce((acc, s) => {
    if (s.type === "common" && valueData?.commonValue) {
      acc += s.amount * valueData?.commonValue;
    }
    return acc;
  }, 0);

  const preferredShareValue = Object.values(grantData).reduce((acc, s) => {
    if (s.type === "preferred" && valueData?.preferredValue) {
      acc += s.amount * valueData?.preferredValue;
    }
    return acc;
  }, 0);

  const marketCap = commonShareValue + preferredShareValue;

  const changeCommonValue = useCallback(() => {
    if (!newCommonValue) {
      return;
    }
    try {
      valueMutation.mutate({
        commonValue: parseFloat(newCommonValue),
      });
    } catch (error) {
      console.error(error);
    }

    setNewCommonValue("");
  }, [newCommonValue, valueMutation]);

  const changePreferredValue = useCallback(() => {
    if (!newPreferredValue) {
      return;
    }
    try {
      valueMutation.mutate({
        preferredValue: parseFloat(newPreferredValue),
      });
    } catch (error) {
      console.error(error);
    }

    setNewPreferredValue("");
  }, [newPreferredValue, valueMutation]);

  return (
    <Stack
      padding={1}
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <Stack
        width="100%"
        direction="row"
        alignItems="center"
        justifyContent="left"
      >
        <Input
          width="30%"
          data-testid="common-input"
          type="number"
          value={newCommonValue}
          placeholder="Enter new value"
          onChange={(e) => setNewCommonValue(e.target.value)}
        />
        <Button data-testid="common-share-btn" onClick={changeCommonValue}>
          Save
        </Button>
        <Text color="teal" fontWeight="bold">
          Common
        </Text>
        <Text>Value: ${`${commonShareValue.toLocaleString()}`}</Text>
        <Text data-testid="common-value">
          Per Share: ${`${valueData?.commonValue}`}
        </Text>
      </Stack>
      <Stack
        width="100%"
        direction="row"
        alignItems="center"
        justifyContent="left"
      >
        <Input
          data-testid="preferred-input"
          width="30%"
          type="number"
          value={newPreferredValue}
          placeholder="Enter new value"
          onChange={(e) => setNewPreferredValue(e.target.value)}
        />
        <Button
          data-testid="preferred-share-btn"
          onClick={changePreferredValue}
        >
          Save
        </Button>
        <Text color="teal" fontWeight="bold">
          Preferred
        </Text>
        <Text>Value: ${`${preferredShareValue.toLocaleString()}`}</Text>
        <Text data-testid="preferred-value">
          Per Share: ${`${valueData?.preferredValue}`}
        </Text>
      </Stack>
      <Text padding={2} color="teal" fontWeight="bold">
        Current Market Cap
      </Text>
      <Text fontWeight="bold">${`${marketCap.toLocaleString()}`}</Text>
    </Stack>
  );
}
