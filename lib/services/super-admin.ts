import { httpRequest } from "../http-client";

export interface SuperAdminRecord {
  id?: string;
  code?: string;
  name?: string;
  username?: string;
  email?: string;
  phone_number?: string | number;
  [key: string]: unknown;
}

export interface SuperAdminUser {
  id: string;
  code: string;
  name: string;
  username: string;
  email: string;
  phone_number: string;
  avatarColor?: string;
  isEnabled: boolean;
  profilePictureUrl?: string;
  status?: string;
}

const base = "/api/super_admin_master";

const asString = (value: unknown) => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

const deriveUsernameFromEmail = (email: string) => {
  const [prefix] = email.split("@");
  return prefix || "";
};

const normalizeSuperAdminRecord = (
  record: Record<string, unknown>,
  isEnabled: boolean,
  index: number,
): SuperAdminUser => {
  const email = asString(record.email);
  const id =
    asString(record.id) ||
    asString(record.super_admin_id) ||
    email ||
    `${isEnabled ? "enabled" : "disabled"}-${index}`;
  const code = asString(record.code) || asString(record.super_admin_code);
  const name = asString(record.name) || asString(record.full_name) || "Unknown";
  const username =
    asString(record.username) ||
    asString(record.user_name) ||
    deriveUsernameFromEmail(email);
  const phoneNumber =
    asString(record.phone_number) ||
    asString(record.phone) ||
    asString(record.mobile_number);

  return {
    id,
    code,
    name,
    username,
    email,
    phone_number: phoneNumber,
    avatarColor: "bg-gray-100",
    isEnabled,
  };
};

export async function addSuperAdmin(payload: {
  name: string;
  email: string;
  phone_number: string | number;
}) {
  return httpRequest<{ message?: string; data?: SuperAdminRecord }>(
    `${base}/add_super_admin`,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updateSuperAdmin(payload: {
  name: string;
  email: string;
  phone_number: string | number;
}) {
  return httpRequest<{ message?: string; data?: SuperAdminRecord }>(
    `${base}/update_super_admin`,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function fetchEnabledSuperAdmins() {
  const resp = await httpRequest<Record<string, unknown>>(
    `${base}/fetch_enabled_super_admins`,
    { method: "GET" },
  );

  const rawData = (resp && (resp.data ?? resp.user_data)) ?? [];
  const dataArray = Array.isArray(rawData) ? rawData : [];

  return {
    message: (resp && (resp.message as string)) || undefined,
    data: dataArray.map((record, index) =>
      normalizeSuperAdminRecord(
        (record as Record<string, unknown>) ?? {},
        true,
        index,
      ),
    ),
  };
}

export async function fetchDisabledSuperAdmins() {
  const resp = await httpRequest<Record<string, unknown>>(
    `${base}/fetch_disabled_super_admins`,
    { method: "GET" },
  );

  const rawData = (resp && (resp.data ?? resp.user_data)) ?? [];
  const dataArray = Array.isArray(rawData) ? rawData : [];

  return {
    message: (resp && (resp.message as string)) || undefined,
    data: dataArray.map((record, index) =>
      normalizeSuperAdminRecord(
        (record as Record<string, unknown>) ?? {},
        false,
        index,
      ),
    ),
  };
}

export async function enableSuperAdmin(enable_user_email: string) {
  const path = `${base}/enable_super_admin?enable_user_email=${encodeURIComponent(
    enable_user_email,
  )}`;
  return httpRequest<{ message?: string; data?: unknown }>(path, {
    method: "GET",
  });
}

export async function disableSuperAdmin(disable_user_email: string) {
  const path = `${base}/disable_super_admin?disable_user_email=${encodeURIComponent(
    disable_user_email,
  )}`;
  return httpRequest<{ message?: string; data?: unknown }>(path, {
    method: "GET",
  });
}

export const superAdminService = {
  addSuperAdmin,
  updateSuperAdmin,
  fetchEnabledSuperAdmins,
  fetchDisabledSuperAdmins,
  enableSuperAdmin,
  disableSuperAdmin,
};
