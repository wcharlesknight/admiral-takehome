import React from "react";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { Navigate, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { getTestRouter, ThemeWrapper } from "../testutils";
import { OnboardingContext } from "../context/OnboardingContext";
import { OnboardingFields } from "../types";
import { UserStep } from "../components/onboarding/UserStep";
import { CompanyStep } from "../components/onboarding/CompanyStep";
import { ShareholdersStep } from "../components/onboarding/ShareholdersStep";
import { ShareholderGrantsStep } from "../components/onboarding/ShareholderGrantsStep";
import { signupReducer } from "../reducers/SignupReducer";
import { DoneStep } from "../components/onboarding/DoneStep";

const defaultOnboardingState = {
  userName: "",
  email: "",
  companyName: "",
  shareholders: {},
  grants: {},
};

const Page = ({
  initialState = defaultOnboardingState,
}: {
  initialState?: OnboardingFields;
}) => {
  const [state, dispatch] = React.useReducer(signupReducer, initialState);
  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="user" replace={true} />} />
        <Route path="user" element={<UserStep />} />
        <Route path="company" element={<CompanyStep />} />
        <Route path="shareholders" element={<ShareholdersStep />} />
        <Route
          path="grants"
          element={<Navigate to={`/grants/0`} replace={true} />}
        />
        <Route
          path="grants/:shareholderID"
          element={<ShareholderGrantsStep />}
        />
        <Route path="done" element={<DoneStep />} />
      </Routes>
    </OnboardingContext.Provider>
  );
};

describe("Onboarding", () => {
  it("should not move to next field if inputs are missing", async () => {
    const Router = getTestRouter("/");
    render(
      <Router>
        <Page />
      </Router>,
      { wrapper: ThemeWrapper }
    );

    const nameField = screen.getByRole("textbox", { name: /who is setting/ });

    const nextButton = screen.getByRole("button", { name: "Next" });
    await userEvent.click(nextButton);
    expect(nameField).toBeInTheDocument();
  });

  it("should allow configuring user details", async () => {
    const Router = getTestRouter("/");
    render(
      <Router>
        <Page />
      </Router>,
      { wrapper: ThemeWrapper }
    );

    const nameField = screen.getByRole("textbox", { name: /who is setting/ });
    await userEvent.click(nameField);
    await userEvent.type(nameField, "Terry");
    expect(nameField).toHaveValue("Terry");

    const emailField = screen.getByRole("textbox", { name: /email/ });
    await userEvent.click(emailField);
    await userEvent.type(emailField, "great@email.com");
    expect(emailField).toHaveValue("great@email.com");

    const nextButton = screen.getByRole("button", { name: "Next" });
    await userEvent.click(nextButton);
    expect(nameField).not.toBeInTheDocument();
  });

  it("should not move to next page if company input is missing", async () => {
    const Router = getTestRouter("/company");
    render(
      <Router>
        <Page />
      </Router>,
      { wrapper: ThemeWrapper }
    );

    const companyNameField = screen.getByRole("textbox", {
      name: /company are we/,
    });

    const nextButton = screen.getByRole("button", { name: "Next" });
    await userEvent.click(nextButton);
    expect(companyNameField).toBeInTheDocument();
  });

  it("should allow configuring company", async () => {
    const Router = getTestRouter("/company");
    render(
      <Router>
        <Page />
      </Router>,
      { wrapper: ThemeWrapper }
    );

    const companyNameField = screen.getByRole("textbox", {
      name: /company are we/,
    });
    await userEvent.type(companyNameField, "Admiral");
    expect(companyNameField).toHaveValue("Admiral");

    const nextButton = screen.getByRole("button", { name: "Next" });
    await userEvent.click(nextButton);
    expect(companyNameField).not.toBeInTheDocument();
  });

  it("should allow configuring shareholders", async () => {
    const Router = getTestRouter("/shareholders");
    render(
      <Router>
        <Page
          initialState={{
            ...defaultOnboardingState,
            companyName: "My Company",
            shareholders: {
              "0": { name: "Jenn", group: "founder", grants: [], id: 0 },
            },
          }}
        />
      </Router>,
      { wrapper: ThemeWrapper }
    );

    expect(screen.getByText("Jenn")).toBeInTheDocument();
    expect(screen.queryByText("Anne")).toBeNull();

    const addShareholdersButton = screen.getByRole("button", {
      name: "Add Shareholder",
    });
    await userEvent.click(addShareholdersButton);

    let newShareholderNameField = screen.getByRole("textbox");
    let groupPicker = screen.getByRole("combobox");
    let createButton = screen.getByRole("button", { name: "Create" });
    await waitFor(() => {
      expect(newShareholderNameField).toBeVisible();
    });
    await userEvent.click(newShareholderNameField);
    await userEvent.paste("Anne");
    await userEvent.selectOptions(groupPicker, "founder");
    await userEvent.click(createButton);

    await waitForElementToBeRemoved(newShareholderNameField);
    expect(screen.getByText("Anne")).toBeInTheDocument();

    await userEvent.click(addShareholdersButton);
    newShareholderNameField = screen.getByRole("textbox");
    groupPicker = screen.getByRole("combobox");
    createButton = screen.getByRole("button", { name: "Create" });
    await waitFor(() => {
      expect(newShareholderNameField).toBeVisible();
    });
    expect(newShareholderNameField).toHaveValue("");

    await userEvent.click(newShareholderNameField);
    await userEvent.paste("Byron");
    await userEvent.selectOptions(groupPicker, "employee");
    await userEvent.click(createButton);

    expect(screen.getByText("Byron")).toBeInTheDocument();
  });

  it("should have proper data displayed", async () => {
    const Router = getTestRouter("/done");
    render(
      <Router>
        <Page
          initialState={{
            email: "test@test.com",
            userName: "test person",
            companyName: "My Company",
            shareholders: {
              0: { name: "Jenn", group: "founder", grants: [1], id: 0 },
              1: { name: "Aaron", group: "employee", grants: [], id: 1 },
              2: { name: "Sam", group: "investor", grants: [], id: 2 },
            },
            grants: {
              1: {
                id: 1,
                name: "Initial issuance",
                amount: 1000,
                issued: Date.now().toLocaleString(),
                type: "common",
              },
            },
          }}
        />
      </Router>,
      { wrapper: ThemeWrapper }
    );

    const companyName = await screen.findByTestId("done-company-name");
    expect(companyName).toHaveTextContent("My Company");
    const jenn = await screen.findByTestId("Jenn-done");
    const aaron = await screen.findByTestId("Aaron-done");
    const sam = await screen.findByTestId("Sam-done");
    expect(jenn).toHaveTextContent("Jenn");
    expect(aaron).toHaveTextContent("Aaron");
    expect(sam).toHaveTextContent("Sam");
  });

  it("should allow configuring shareholders", async () => {
    const Router = getTestRouter("/shareholders");
    render(
      <Router>
        <Page
          initialState={{
            ...defaultOnboardingState,
            companyName: "My Company",
            shareholders: {
              "0": { name: "Jenn", group: "founder", grants: [], id: 0 },
            },
          }}
        />
      </Router>,
      { wrapper: ThemeWrapper }
    );

    expect(screen.getByText("Jenn")).toBeInTheDocument();
    expect(screen.queryByText("Anne")).toBeNull();

    const addShareholdersButton = screen.getByRole("button", {
      name: "Add Shareholder",
    });
    await userEvent.click(addShareholdersButton);

    let newShareholderNameField = screen.getByRole("textbox");
    let groupPicker = screen.getByRole("combobox");
    let createButton = screen.getByRole("button", { name: "Create" });
    await waitFor(() => {
      expect(newShareholderNameField).toBeVisible();
    });
    await userEvent.click(newShareholderNameField);
    await userEvent.paste("Anne");
    await userEvent.selectOptions(groupPicker, "founder");
    await userEvent.click(createButton);

    await waitForElementToBeRemoved(newShareholderNameField);
    expect(screen.getByText("Anne")).toBeInTheDocument();

    await userEvent.click(addShareholdersButton);
    newShareholderNameField = screen.getByRole("textbox");
    groupPicker = screen.getByRole("combobox");
    createButton = screen.getByRole("button", { name: "Create" });
    await waitFor(() => {
      expect(newShareholderNameField).toBeVisible();
    });
    expect(newShareholderNameField).toHaveValue("");

    await userEvent.click(newShareholderNameField);
    await userEvent.paste("Byron");
    await userEvent.selectOptions(groupPicker, "employee");
    await userEvent.click(createButton);

    expect(screen.getByText("Byron")).toBeInTheDocument();
  });
});
