import { Data } from "./data";

export interface RoleRights {
  key: string;
  data: Data;
  rightId: number;
  checked: boolean;
  partialChecked: boolean;
}
