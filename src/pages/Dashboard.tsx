import React, { useCallback } from "react";
import { VictoryPie } from "victory";
import { Link, useParams } from "react-router-dom";
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
  Spinner,
  Alert,
  AlertTitle,
  AlertIcon,
  Select,
  Box,
} from "@chakra-ui/react";
import {
  CompanyValue,
  Grant,
  Query,
  Shareholder,
  ShareholderGroup,
} from "../types";
import { useMutation, useQuery, useQueryClient } from "react-query";
import produce from "immer";
import { MarketCap } from "../components/MarketCap";

export function Dashboard() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();
  const [newShareholder, setNewShareholder] = React.useState<
    Omit<Shareholder, "id" | "grants">
  >({ name: "", group: "employee" });

  const { mode, view } = useParams();

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
  // These are caught down below if there is an error
  const grant = useQuery<Query<Grant>, string>("grants", () =>
    fetch("/grants").then((e) => e.json())
  );
  const shareholder = useQuery<Query<Shareholder>>("shareholders", () =>
    fetch("/shareholders").then((e) => e.json())
  );
  const value = useQuery<CompanyValue>("value", () =>
    fetch("/value").then((e) => e.json())
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

  if (grant.status === "error") {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error: {grant.error}</AlertTitle>
      </Alert>
    );
  }
  if (
    grant.status !== "success" ||
    shareholder.status !== "success" ||
    value.status !== "success"
  ) {
    return <Spinner />;
  }
  if (!grant.data || !shareholder.data || !value.data) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Failed to get any data</AlertTitle>
      </Alert>
    );
  }
  // If there are no grants, don't show the pie chart as it takes up space and looks bad
  const showPie = Object.values(grant.data).length;
  // This may seem long and confusing but we basically have three different views
  // that are split by value (multiplied) or by amount (not multiplied)
  // and we iterate accordingly mapping a new x, y value for the pie
  function pieData() {
    if (!shareholder.data || !grant.data) {
      return [];
    }
    const commonMultiplier =
      value.data?.commonValue && view === "value" ? value.data.commonValue : 1;
    const preferredMultiplier =
      value.data?.preferredValue && view === "value"
        ? value.data.preferredValue
        : 1;

    if (mode === "investor") {
      return Object.values(shareholder.data)
        .map((s) => ({
          x: s.name,
          y: s.grants.reduce((acc, grantID) => {
            if (grant.data[grantID].type === "common") {
              acc += grant.data[grantID].amount * commonMultiplier;
            }
            if (grant.data[grantID].type === "preferred") {
              acc += grant.data[grantID].amount * preferredMultiplier;
            }
            return acc;
          }, 0),
        }))
        .filter((e) => e.y > 0);
    } else if (mode === "group") {
      return ["investor", "founder", "employee"].map((group) => ({
        x: group,
        y: Object.values(shareholder?.data ?? {})
          .filter((s) => s.group === group)
          .flatMap((s) => s.grants)
          .reduce((acc, grantID) => {
            if (grant.data[grantID].type === "common") {
              acc += grant.data[grantID].amount * commonMultiplier;
            }
            if (grant.data[grantID].type === "preferred") {
              acc += grant.data[grantID].amount * preferredMultiplier;
            }
            return acc;
          }, 0),
      }));
    } else {
      return ["common", "preferred"].map((type) => ({
        x: type,
        y: Object.values(shareholder?.data ?? {})
          .flatMap((s) => s.grants)
          .filter((g) => grant.data[g].type === type)
          .reduce((acc, grantID) => {
            if (grant.data[grantID].type === "common") {
              acc += grant.data[grantID].amount * commonMultiplier;
            }
            if (grant.data[grantID].type === "preferred") {
              acc += grant.data[grantID].amount * preferredMultiplier;
            }
            return acc;
          }, 0),
      }));
    }
  }

  return (
    <Stack>
      <Stack direction="row" justify="space-between" alignItems="baseline">
        <Heading
          size="md"
          bgGradient="linear(to-br, teal.400, teal.100)"
          bgClip="text"
        >
          Fair Share
        </Heading>
        <Stack direction="row">
          <Button
            data-testid="dashboard-investor"
            colorScheme="teal"
            as={Link}
            to={`/dashboard/investor/${view}`}
            variant="ghost"
            isActive={mode === "investor"}
          >
            By Investor
          </Button>
          <Button
            data-testid="dashboard-group"
            colorScheme="teal"
            as={Link}
            to={`/dashboard/group/${view}`}
            variant="ghost"
            isActive={mode === "group"}
          >
            By Group
          </Button>
          <Button
            data-testid="dashboard-sharetype"
            colorScheme="teal"
            as={Link}
            to={`/dashboard/sharetype/${view}`}
            variant="ghost"
            isActive={mode === "sharetype"}
          >
            By Share Type
          </Button>
        </Stack>
      </Stack>
      <MarketCap grantData={grant.data} value={value.data} />
      <Stack direction="row" justifyContent="center">
        <Button
          colorScheme="teal"
          as={Link}
          to={`/dashboard/${mode}/amount`}
          variant="ghost"
          isActive={view === "amount"}
        >
          By Amount
        </Button>
        <Button
          colorScheme="teal"
          as={Link}
          to={`/dashboard/${mode}/value`}
          variant="ghost"
          isActive={view === "value"}
        >
          By Value
        </Button>
      </Stack>
      {showPie && (
        <VictoryPie
          data-testid="pie-chart"
          colorScale="blue"
          padding={{ top: 40, bottom: 50, left: 80, right: 80 }}
          data={pieData()}
          labels={({ datum }) => (datum.y ? `${datum.x}` : "")}
        />
      )}
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
              {Object.values(shareholder.data).map((s) => (
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
                    {
                      s.grants.filter((g) => grant.data[g].type === "common")
                        .length
                    }
                  </Td>
                  <Td data-testid={`shareholder-${s.name}-common`}>
                    {s.grants
                      .filter((g) => grant.data[g].type === "common")
                      .reduce(
                        (acc, grantID) => acc + grant.data[grantID].amount,
                        0
                      )}
                  </Td>
                  <Td data-testid={`shareholder-${s.name}-preferred-grants`}>
                    {
                      s.grants.filter((g) => grant.data[g].type === "preferred")
                        .length
                    }
                  </Td>
                  <Td data-testid={`shareholder-${s.name}-preferred`}>
                    {s.grants
                      .filter((g) => grant.data[g].type === "preferred")
                      .reduce(
                        (acc, grantID) => acc + grant.data[grantID].amount,
                        0
                      )}
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
