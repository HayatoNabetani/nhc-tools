import { DefaultHeader } from "@/constants/Header";
import { atom } from "recoil";

const userState = atom<ToolSet>({
  key: "tool",
  default: DefaultHeader,
});

export default userState;
