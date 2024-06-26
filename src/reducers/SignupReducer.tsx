import produce from "immer";
import { OnboardingAction, OnboardingFields } from "../types";

export function signupReducer(
  state: OnboardingFields,
  action: OnboardingAction
) {
  return produce(state, (draft) => {
    switch (action.type) {
      case "updateUser":
        draft.userName = action.payload;
        if (draft.shareholders[0]) {
          draft.shareholders[0].name = action.payload;
        } else {
          draft.shareholders[0] = {
            id: 0,
            name: action.payload,
            grants: [],
            group: "founder",
          };
        }
        sessionStorage.setItem("onboarding", JSON.stringify(draft));
        break;
      case "updateEmail":
        draft.email = action.payload;
        sessionStorage.setItem("onboarding", JSON.stringify(draft));
        break;
      case "updateCompany":
        draft.companyName = action.payload;
        sessionStorage.setItem("onboarding", JSON.stringify(draft));
        break;
      case "addShareholder":
        const nextShareholderID =
          Math.max(
            0,
            ...Object.keys(draft.shareholders).map((e) => parseInt(e, 10))
          ) + 1;
        draft.shareholders[nextShareholderID] = {
          id: nextShareholderID,
          grants: [],
          ...action.payload,
        };
        sessionStorage.setItem("onboarding", JSON.stringify(draft));
        break;
      case "addGrant":
        const nextGrantID =
          Math.max(
            0,
            ...Object.keys(draft.grants).map((e) => parseInt(e, 10))
          ) + 1;
        draft.grants[nextGrantID] = {
          id: nextGrantID,
          ...action.payload.grant,
        };
        draft.shareholders[action.payload.shareholderID].grants.push(
          nextGrantID
        );
        sessionStorage.setItem("onboarding", JSON.stringify(draft));
        break;
    }
  });
}