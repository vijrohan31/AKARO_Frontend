import { authApi } from "@/lib/api";
import { logoutAction } from "./actions";

export const handleLogout = async () => {
  try {
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    await authApi.logout().catch(() => {});
    await logoutAction();
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  } catch (error: any) {
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  }
};
