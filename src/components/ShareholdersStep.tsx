import React from "react";
import {
  Link,
} from "react-router-dom";
import {
  Text,
  Stack,
  Button,
  Input,
  StackDivider,
  Modal,
  useDisclosure,
  ModalContent,
  Select,
  Badge,
} from "@chakra-ui/react";
import { useContext } from "react";
import {  Shareholder, ShareholderGroup} from "../types";
import { OnboardingContext } from "../context/OnboardingContext";

export function ShareholdersStep() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { shareholders, companyName, dispatch } = useContext(OnboardingContext);
  const [newShareholder, setNewShareholder] = React.useState<
    Omit<Shareholder, "id" | "grants">
  >({ name: "", group: "employee" });
  console.log(shareholders, "shareholders")
  function submitNewShareholder(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "addShareholder", payload: newShareholder });
    setNewShareholder({ name: "", group: "employee" });
    onClose();
  }

  return (
    <Stack>
      <Text color="teal.400">
        {/* TODO: redirect to previous step if company name isn't there*/}
        Who are <strong>{companyName}</strong>'s shareholders?
      </Text>
      <Stack divider={<StackDivider borderColor="teal-200" />}>
        {Object.values(shareholders).map((s, i) => (
          <Stack justify="space-between" direction="row" key={i}>
            <Text>{s.name}</Text>
            <Badge>{s.group}</Badge>
          </Stack>
        ))}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <Stack p="10" as="form" onSubmit={submitNewShareholder}>
              <Input
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
              <Button type="submit" colorScheme="teal">
                Create
              </Button>
            </Stack>
          </ModalContent>
        </Modal>
      </Stack>
      <Button colorScheme="teal" variant="outline" onClick={onOpen}>
        Add Shareholder
      </Button>
      <Button as={Link} to="/start/grants" colorScheme="teal">
        Next
      </Button>
    </Stack>
  );
}