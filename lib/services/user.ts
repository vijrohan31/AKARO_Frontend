import { httpRequest } from "../http-client";

export interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  is_enabled?: boolean;
  status?: string;
  [key: string]: unknown;
}

const base = "/api/user_master";

export const userService = {
  async fetchUsers() {
    const [enabled, disabled] = await Promise.all([
      httpRequest<Record<string, unknown>>(`${base}/fetch_enabled_users`, { method: "GET" }),
      httpRequest<Record<string, unknown>>(`${base}/fetch_disabled_users`, { method: "GET" })
    ]);
    
    const extractArray = (res: any) => {
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.user_data)) return res.user_data;
      if (Array.isArray(res?.users)) return res.users;
      return [];
    };

    const enabledData = extractArray(enabled) as any[];
    const disabledData = extractArray(disabled) as any[];
    
    return [
      ...enabledData.map((u: any) => ({ ...u, status: "Enabled", is_enabled: true })),
      ...disabledData.map((u: any) => ({ ...u, status: "Disabled", is_enabled: false }))
    ];
  },

  async addUser(payload: any) {
    return httpRequest(`${base}/add_user`, { method: "POST", body: payload });
  },

  async updateUser(payload: any) {
    return httpRequest(`${base}/update_user`, { method: "POST", body: payload });
  },

  async disableUser(email: string) {
    return httpRequest(`${base}/disable_user?disable_user_email=${encodeURIComponent(email)}`, { method: "POST" });
  },

  async toggleUserStatus(email: string, status: boolean) {
    if (status) {
      return httpRequest(`${base}/enable_user?enable_user_email=${encodeURIComponent(email)}`, { method: "POST" });
    }
    return httpRequest(`${base}/disable_user?disable_user_email=${encodeURIComponent(email)}`, { method: "POST" });
  },

  async changePassword(payload: { old_password: string; new_password: string }) {
    return httpRequest("/api/change_password", { method: "POST", body: payload });
  },
};
