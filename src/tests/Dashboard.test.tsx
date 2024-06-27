import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { getTestRouter, server, ThemeWrapper } from "../testutils";
import { Dashboard } from "../pages/Dashboard";
import { MemoryRouter, Route, Routes } from "react-router";
import { getHandlers } from "../handlers";
import userEvent from "@testing-library/user-event";

describe("Dashboard", () => {
  it("should show a row for all shareholders", async () => {
    const Router = getTestRouter("/dashboard");
    const handlers = getHandlers(
      {
        company: { name: "My Company" },
        shareholders: {
          0: { name: "Tonya", grants: [1, 2], group: "founder", id: 0 },
          1: { name: "Tony", grants: [3], group: "employee", id: 1 },
          2: { name: "Tiffany", grants: [4, 5], group: "employee", id: 2 },
          3: { name: "Timothy", grants: [6], group: "investor", id: 3 },
        },
        grants: {
          1: {
            id: 1,
            name: "Initial Grant",
            amount: 1000,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          2: {
            id: 2,
            name: "Incentive Package 2020",
            amount: 500,
            issued: Date.now().toLocaleString(),
            type: "preferred",
          },
          3: {
            id: 3,
            name: "Options Conversion 2020",
            amount: 100,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          4: {
            id: 4,
            name: "Options Conversion 2019",
            amount: 90,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          5: {
            id: 5,
            name: "Options Conversion 2020",
            amount: 30,
            issued: Date.now().toLocaleString(),
            type: "preferred",
          },
          6: {
            id: 6,
            name: "Series A Purchase",
            amount: 500,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
        },
      },
      false
    );
    server.use(...handlers);

    render(
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>,
      { wrapper: ThemeWrapper }
    );

    await screen.findByText("Tonya");
    expect(
      screen.getByTestId("shareholder-Tonya-common-grants")
    ).toHaveTextContent("1");
    expect(screen.getByTestId("shareholder-Tonya-group")).toHaveTextContent(
      "founder"
    );
    expect(screen.getByTestId("shareholder-Tonya-common")).toHaveTextContent(
      "1000"
    );
    expect(
      screen.getByTestId("shareholder-Tonya-preferred-grants")
    ).toHaveTextContent("1");
    expect(screen.getByTestId("shareholder-Tonya-preferred")).toHaveTextContent(
      "500"
    );

    expect(
      screen.getByTestId("shareholder-Tony-common-grants")
    ).toHaveTextContent("1");
    expect(screen.getByTestId("shareholder-Tony-group")).toHaveTextContent(
      "employee"
    );
    expect(screen.getByTestId("shareholder-Tony-common")).toHaveTextContent(
      "100"
    );

    expect(
      screen.getByTestId("shareholder-Tiffany-common-grants")
    ).toHaveTextContent("1");
    expect(screen.getByTestId("shareholder-Tiffany-group")).toHaveTextContent(
      "employee"
    );
    expect(screen.getByTestId("shareholder-Tiffany-common")).toHaveTextContent(
      "90"
    );
    expect(
      screen.getByTestId("shareholder-Tiffany-preferred")
    ).toHaveTextContent("30");

    expect(
      screen.getByTestId("shareholder-Tiffany-preferred-grants")
    ).toHaveTextContent("1");

    expect(
      screen.getByTestId("shareholder-Timothy-common-grants")
    ).toHaveTextContent("1");
    expect(screen.getByTestId("shareholder-Timothy-group")).toHaveTextContent(
      "investor"
    );
    expect(screen.getByTestId("shareholder-Timothy-common")).toHaveTextContent(
      "500"
    );
  });

  it("should show investors in investors chart", async () => {
    const Router = getTestRouter("/dashboard/investor/amount");
    const handlers = getHandlers(
      {
        company: { name: "My Company" },
        shareholders: {
          0: { name: "Tonya", grants: [1, 2], group: "founder", id: 0 },
          1: { name: "Tommy", grants: [3], group: "employee", id: 1 },
          2: { name: "Tiffany", grants: [4, 5], group: "employee", id: 2 },
          3: { name: "Timothy", grants: [], group: "investor", id: 3 },
        },
        grants: {
          1: {
            id: 1,
            name: "Initial Grant",
            amount: 1000,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          2: {
            id: 2,
            name: "Incentive Package 2020",
            amount: 500,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          3: {
            id: 3,
            name: "Options Conversion 2020",
            amount: 100,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          4: {
            id: 4,
            name: "Options Conversion 2019",
            amount: 90,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          5: {
            id: 5,
            name: "Options Conversion 2020",
            amount: 30,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
        },
      },
      false
    );
    server.use(...handlers);

    render(
      <Router>
        <Routes>
          <Route path="/dashboard/:mode/:view" element={<Dashboard />} />
        </Routes>
      </Router>,
      { wrapper: ThemeWrapper }
    );

    const chart = await screen.findByTestId("pie-chart");
    expect(within(chart).getByText(/Tonya/)).toBeInTheDocument();
    expect(within(chart).getByText(/Tommy/)).toBeInTheDocument();
    expect(within(chart).getByText(/Tiffany/)).toBeInTheDocument();
    expect(within(chart).queryByText(/Timothy/)).toBeNull();
  });

  it("should show groups in groups chart", async () => {
    const Router = getTestRouter("/dashboard/group/amount");
    const handlers = getHandlers(
      {
        company: { name: "My Company" },
        shareholders: {
          0: { name: "Tonya", grants: [1, 2], group: "founder", id: 0 },
          3: { name: "Timothy", grants: [6], group: "investor", id: 3 },
        },
        grants: {
          1: {
            id: 1,
            name: "Initial Grant",
            amount: 1000,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          2: {
            id: 2,
            name: "Incentive Package 2020",
            amount: 500,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          6: {
            id: 6,
            name: "Series A Purchase",
            amount: 500,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
        },
      },
      false
    );
    server.use(...handlers);

    render(
      <Router>
        <Routes>
          <Route path="/dashboard/:mode/:view" element={<Dashboard />} />
        </Routes>
      </Router>,
      { wrapper: ThemeWrapper }
    );

    const groupsChartButton = await screen.findByRole("link", {
      name: /by group/i,
    });
    await userEvent.click(groupsChartButton);

    const chart = await screen.findByTestId("pie-chart");
    expect(within(chart).getByText(/founder/)).toBeInTheDocument();
    expect(within(chart).getByText(/investor/)).toBeInTheDocument();
  });

  it("should show shares in share type chart", async () => {
    const Router = getTestRouter("/dashboard/sharetype/amount");
    const handlers = getHandlers(
      {
        company: { name: "My Company" },
        shareholders: {
          0: { name: "Tonya", grants: [1, 2], group: "founder", id: 0 },
          1: { name: "Tommy", grants: [3], group: "employee", id: 1 },
          2: { name: "Tiffany", grants: [4, 5], group: "employee", id: 2 },
          3: { name: "Timothy", grants: [], group: "investor", id: 3 },
        },
        grants: {
          1: {
            id: 1,
            name: "Initial Grant",
            amount: 1000,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          2: {
            id: 2,
            name: "Incentive Package 2020",
            amount: 500,
            issued: Date.now().toLocaleString(),
            type: "preferred",
          },
          3: {
            id: 3,
            name: "Options Conversion 2020",
            amount: 100,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          4: {
            id: 4,
            name: "Options Conversion 2019",
            amount: 90,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          5: {
            id: 5,
            name: "Options Conversion 2020",
            amount: 30,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
        },
      },
      false
    );
    server.use(...handlers);

    render(
      <Router>
        <Routes>
          <Route path="/dashboard/:mode/:view" element={<Dashboard />} />
        </Routes>
      </Router>,
      { wrapper: ThemeWrapper }
    );

    const shareTypeChartButton = await screen.findByRole("link", {
      name: /by share type/i,
    });
    await userEvent.click(shareTypeChartButton);

    const chart = await screen.findByTestId("pie-chart");
    expect(within(chart).getByText(/preferred/)).toBeInTheDocument();
    expect(within(chart).getByText(/common/)).toBeInTheDocument();
    expect(within(chart).queryByText(/Timothy/)).toBeNull();
  });

  it("should have default per share values of $100", async () => {
    const Router = getTestRouter("/dashboard/sharetype/amount");
    const handlers = getHandlers(
      {
        company: { name: "My Company" },
        shareholders: {
          0: { name: "Tonya", grants: [1, 2], group: "founder", id: 0 },
          1: { name: "Tommy", grants: [3], group: "employee", id: 1 },
          2: { name: "Tiffany", grants: [4, 5], group: "employee", id: 2 },
          3: { name: "Timothy", grants: [], group: "investor", id: 3 },
        },
        grants: {
          1: {
            id: 1,
            name: "Initial Grant",
            amount: 1000,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          2: {
            id: 2,
            name: "Incentive Package 2020",
            amount: 500,
            issued: Date.now().toLocaleString(),
            type: "preferred",
          },
          3: {
            id: 3,
            name: "Options Conversion 2020",
            amount: 100,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          4: {
            id: 4,
            name: "Options Conversion 2019",
            amount: 90,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          5: {
            id: 5,
            name: "Options Conversion 2020",
            amount: 30,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
        },
      },
      false
    );
    server.use(...handlers);

    render(
      <Router>
        <Routes>
          <Route path="/dashboard/:mode/:view" element={<Dashboard />} />
        </Routes>
      </Router>,
      { wrapper: ThemeWrapper }
    );

    const chart = await screen.findByTestId("common-value");
    expect(within(chart).getByText(/100/)).toBeInTheDocument();
  });

  it("should change common and preferred value from new input", async () => {
    const Router = getTestRouter("/dashboard/sharetype/amount");
    const handlers = getHandlers(
      {
        company: { name: "My Company" },
        shareholders: {
          0: { name: "Tonya", grants: [1, 2], group: "founder", id: 0 },
          1: { name: "Tommy", grants: [3], group: "employee", id: 1 },
        },
        grants: {
          1: {
            id: 1,
            name: "Initial Grant",
            amount: 1000,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          2: {
            id: 2,
            name: "Incentive Package 2020",
            amount: 500,
            issued: Date.now().toLocaleString(),
            type: "preferred",
          },
          3: {
            id: 3,
            name: "Options Conversion 2020",
            amount: 100,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
        },
      },
      false
    );
    server.use(...handlers);

    render(
      <Router>
        <Routes>
          <Route path="/dashboard/:mode/:view" element={<Dashboard />} />
        </Routes>
      </Router>,
      { wrapper: ThemeWrapper }
    );

    const commonValue = await screen.findByTestId("common-value");
    const commonInput = await screen.findByTestId("common-input");
    const commonBtn = await screen.findByTestId("common-share-btn");
    await userEvent.click(commonInput);
    await userEvent.paste("200");
    await userEvent.click(commonBtn);
    expect(within(commonValue).getByText(/200/)).toBeInTheDocument();
    const preferredValue = await screen.findByTestId("preferred-value");
    const preferredInput = await screen.findByTestId("preferred-input");
    const preferredBtn = await screen.findByTestId("preferred-share-btn");
    await userEvent.click(preferredInput);
    await userEvent.paste("200");
    await userEvent.click(preferredBtn);
    expect(within(preferredValue).getByText(/200/)).toBeInTheDocument();
  });

  it("should allow adding new shareholders", async () => {
    const Router = getTestRouter("/dashboard");
    const handlers = getHandlers(
      {
        company: { name: "My Company" },
        shareholders: {
          0: { name: "Tonya", grants: [1, 2], group: "founder", id: 0 },
        },
        grants: {
          1: {
            id: 1,
            name: "Initial Grant",
            amount: 1000,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
          2: {
            id: 2,
            name: "Incentive Package 2020",
            amount: 500,
            issued: Date.now().toLocaleString(),
            type: "common",
          },
        },
      },
      false
    );
    server.use(...handlers);

    render(
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>,
      { wrapper: ThemeWrapper }
    );

    const addShareholderButton = await screen.findByRole("button", {
      name: /add shareholder/i,
    });
    await userEvent.click(addShareholderButton);

    const shareholderNameInput = await screen.findByTestId(
      "new-shareholder-name"
    );
    const groupCombo = screen.getByRole("combobox");
    const saveButton = await screen.findByTestId("save-new-shareholder");
    await userEvent.click(shareholderNameInput);
    await userEvent.paste("Mike");
    await userEvent.selectOptions(groupCombo, "investor");

    await userEvent.click(saveButton);

    await waitFor(() => expect(shareholderNameInput).not.toBeVisible());
    expect(
      await screen.findByTestId("shareholder-Mike-group")
    ).toHaveTextContent("investor");
  }, 10000);
});
