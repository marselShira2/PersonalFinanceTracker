import { Data } from "./data";
import { RoleRights } from "./role-rights";

export interface RoleRightsListDTO {
  key: string;
  data: Data;
  children: RoleRights[];
  checked: boolean;
  partialChecked: boolean;
}
