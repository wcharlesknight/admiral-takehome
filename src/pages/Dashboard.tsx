import React from "react";
import { VictoryPie } from "victory";
import { Link, useParams } from "react-router-dom";
import {
  Heading,
  Stack,
  Button,
  Spinner,
  Alert,
  AlertTitle,
  AlertIcon,
} from "@chakra-ui/react";
import { CompanyValue, Grant, Query, Shareholder } from "../types";
import { useQuery } from "react-query";
import { MarketCap } from "../components/dashboard/MarketCap";
import { ShareholderTable } from "../components/dashboard/ShareholderTable";

export function Dashboard() {
  const { mode, view } = useParams();
  const SHAREHOLDER_GROUPS = ["investor", "founder", "employee"];
  const SHARE_TYPES = ["common", "preferred"];
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
      return SHAREHOLDER_GROUPS.map((group) => ({
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
    } else if (mode === "sharetype") {
      return SHARE_TYPES.map((type) => ({
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
      <MarketCap grantData={grant.data} valueData={value.data} />
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
      <ShareholderTable
        grantData={grant.data}
        shareholderData={shareholder.data}
      />
    </Stack>
  );
}
