export interface User {
  name: string;
  email: string;
  shareholderID?: number;
}

export interface Company {
  name: string;
}

export type ID<T> = {
  [id: number]: T
}

export interface Grant {
  id: number;
  name: string;
  amount: number;
  issued: string;
  type: "preferred" | "common";
}
export interface Shareholder {
  id: number;
  name: string;
  // TODO: allow inviting/creating user account for orphan shareholders
  email?: string;
  grants: number[];
  group: ShareholderGroup
}

export type ShareholderGroup = "employee" | "founder" | "investor";

export interface OnboardingFields {
  companyName: string;
  userName: string;
  email: string;
  shareholders: { [shareholderID: number]: Shareholder };
  grants: { [grantID: number]: Grant };
}
interface UpdateUserAction {
  type: "updateUser";
  payload: string;
}
interface UpdateEmail {
  type: "updateEmail";
  payload: string;
}
interface UpdateCompanyAction {
  type: "updateCompany";
  payload: string;
}
interface AddShareholderAction {
  type: "addShareholder";
  payload: Omit<Shareholder, "id" | "grants">;
}
interface AddGrant {
  type: "addGrant";
  payload: { shareholderID: number; grant: Omit<Grant, "id"> };
}
type OnboardingAction =
  | UpdateUserAction
  | UpdateEmail
  | UpdateCompanyAction
  | AddShareholderAction
  | AddGrant;