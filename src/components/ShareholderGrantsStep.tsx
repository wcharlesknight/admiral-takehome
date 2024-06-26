import React from "react";
import {
  Link,
  Navigate,
  useParams,
} from "react-router-dom";
import {
  Text,
  Stack,
  Button,
  Input,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  FormControl,
  Modal,
  useDisclosure,
  ModalContent,
} from "@chakra-ui/react";
import { useContext } from "react";
import {  Grant  } from "../types" 
import { OnboardingContext } from "../context/OnboardingContext";

export function ShareholderGrantsStep() {
  const { shareholders, grants, dispatch } = useContext(OnboardingContext);
  const { shareholderID = '' } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const shareholder = shareholders[parseInt(shareholderID, 10)];
  console.log(shareholders,  "shareholder")
  const [draftGrant, setDraftGrant] = React.useState<Omit<Grant, "id">>({
    name: "",
    amount: 0,
    issued: "",
    type: "common",
  });
  console.log(shareholderID, "shareholderID", parseInt(shareholderID, 10), "parseInt(shareholderID, 10)")
  // console.log(!shareholders[shareholder.id + 1], "to done")
  console.log("shareholders: ", shareholders)
  if (!shareholder) {
    console.log("to start shareholders")
    return <Navigate to="/start/shareholders" replace={true} />;
  }
 
  const nextLink =  !shareholders[shareholder.id + 1] ? `../done`
    : `../grants/${shareholder.id + 1}`;

  function submitGrant(e: React.FormEvent) {
    e.preventDefault();
    dispatch({
      type: "addGrant",
      payload: {
        shareholderID: parseInt(shareholderID, 10),
        grant: draftGrant,
      },
    });
    onClose();
    setDraftGrant({ name: "", amount: 0, issued: "", type: "common" });
  }

  return (
    <Stack>
      <Text color="teal-400">
        What grants does <strong>{shareholder.name}</strong> have?
      </Text>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Occasion</Th>
            <Th>Amount</Th>
            <Th>Date</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {shareholder.grants.map((gid) => (
            <Tr key={gid}>
              <Td>{grants[gid].name}</Td>
              <Td>{grants[gid].amount}</Td>
              <Td>{grants[gid].issued}</Td>
            </Tr>
          ))}
          {shareholder.grants.length === 0 && (
            <Tr>
              <Td colSpan={3} textAlign="center">
                No grants to show for <strong>{shareholder.name}</strong>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
      <Button variant="outline" onClick={onOpen}>
        Add Grant
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <Stack p="10" as="form" onSubmit={submitGrant}>
            <Text>
              A <strong>Grant</strong> is any occasion where new shares are
              issued to a shareholder.
            </Text>

            <FormControl>
              <Input
                variant="flushed"
                placeholder="Name"
                data-testid="grant-name"
                value={draftGrant.name}
                onChange={(e) =>
                  setDraftGrant((g) => ({ ...g, name: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <Input
                variant="flushed"
                placeholder="Shares"
                data-testid="grant-amount"
                value={draftGrant.amount || ""}
                onChange={(e) =>
                  setDraftGrant((g) => ({
                    ...g,
                    amount: parseInt(e.target.value, 10),
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <Input
                variant="flushed"
                type="date"
                data-testid="grant-issued"
                value={draftGrant.issued}
                onChange={(e) =>
                  setDraftGrant((g) => ({ ...g, issued: e.target.value }))
                }
              />
            </FormControl>
            <Button type="submit">Save</Button>
          </Stack>
        </ModalContent>
      </Modal>
      <Button as={Link} to={nextLink} colorScheme="teal">
        Next
      </Button>
    </Stack>
  );
}