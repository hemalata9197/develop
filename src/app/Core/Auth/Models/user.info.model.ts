import { MenuItem } from "../auth.service";
export interface UserInfo {
token: string;
roles: string[];
permissions: string[];
menu: MenuItem[];
}