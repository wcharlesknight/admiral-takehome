import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Text,
  Heading,
  Stack,
  Button,
  Input,
  Table,
  Thead,
  Tr,
  Tbody,
  Td,
  Modal,
  useDisclosure,
  ModalContent,
  Select,
  Box,
} from "@chakra-ui/react";
import { Grant, Query, Shareholder, ShareholderGroup } from "../../types";
import { useMutation, useQueryClient } from "react-query";
import produce from "immer";

type Props = { grantData: Query<Grant>; shareholderData: Query<Shareholder> };

export function ShareholderTable({
  grantData: grant,
  shareholderData: shareholder,
}: Props) {
  const queryClient = useQueryClient();
  const [newShareholder, setNewShareholder] = React.useState<
    Omit<Shareholder, "id" | "grants">
  >({ name: "", group: "employee" });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const shareholderMutation = useMutation<
    Shareholder,
    unknown,
    Omit<Shareholder, "id" | "grants">
  >(
    (shareholder) =>
      fetch("/shareholder/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shareholder),
      }).then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Failed to create shareholder");
        }
      }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData<Query<Shareholder> | undefined>(
          "shareholders",
          (s) => {
            if (s) {
              return produce(s, (draft) => {
                draft[data.id] = data;
              });
            }
          }
        );
      },
    }
  );

  const submitNewShareholder = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await shareholderMutation.mutateAsync(newShareholder);
      } catch (error) {
        console.error(error);
      }
      onClose();
    },
    [newShareholder, shareholderMutation, onClose]
  );
  return (
    <Stack>
      <Stack>
        <Box justifyContent="center">
          <Heading marginLeft={2}>Shareholders</Heading>
          <Table>
            <Thead>
              <Tr>
                <Td>Name</Td>
                <Td>Group</Td>
                <Td>Common Grants</Td>
                <Td>Common</Td>
                <Td>Preferred Grants</Td>
                <Td>Preferred</Td>
              </Tr>
            </Thead>
            <Tbody>
              {Object.values(shareholder).map((s) => (
                <Tr key={s.id}>
                  <Td>
                    <Link to={`/shareholder/${s.id}`}>
                      <Stack direction="row" alignItems="center">
                        <Text color="teal.600">{s.name}</Text>
                        <ArrowForwardIcon color="teal.600" />
                      </Stack>
                    </Link>
                  </Td>
                  <Td data-testid={`shareholder-${s.name}-group`}>{s.group}</Td>
                  <Td data-testid={`shareholder-${s.name}-common-grants`}>
                    {s.grants.filter((g) => grant[g].type === "common").length}
                  </Td>
                  <Td data-testid={`shareholder-${s.name}-common`}>
                    {s.grants
                      .filter((g) => grant[g].type === "common")
                      .reduce((acc, grantID) => acc + grant[grantID].amount, 0)}
                  </Td>
                  <Td data-testid={`shareholder-${s.name}-preferred-grants`}>
                    {
                      s.grants.filter((g) => grant[g].type === "preferred")
                        .length
                    }
                  </Td>
                  <Td data-testid={`shareholder-${s.name}-preferred`}>
                    {s.grants
                      .filter((g) => grant[g].type === "preferred")
                      .reduce((acc, grantID) => acc + grant[grantID].amount, 0)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <Button justifyContent="center" alignContent="center" onClick={onOpen}>
          Add Shareholder
        </Button>
      </Stack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <Stack p="10" as="form" onSubmit={submitNewShareholder}>
            <Input
              data-testid="new-shareholder-name"
              value={newShareholder.name}
              placeholder="Shareholder Name"
              onChange={(e) =>
                setNewShareholder((s) => ({ ...s, name: e.target.value }))
              }
            />
            <Select
              placeholder="Type of shareholder"
              value={newShareholder.group}
              onChange={(e) =>
                setNewShareholder((s) => ({
                  ...s,
                  group: e.target.value as ShareholderGroup,
                }))
              }
            >
              <option value="investor">Investor</option>
              <option value="founder">Founder</option>
              <option value="employee">Employee</option>
            </Select>
            <Button
              data-testid="save-new-shareholder"
              type="submit"
              colorScheme="teal"
            >
              Save
            </Button>
          </Stack>
        </ModalContent>
      </Modal>
    </Stack>
  );
}
