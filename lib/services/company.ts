import { httpRequest } from "../http-client";

export interface Company {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  is_verified?: boolean;
  is_approved?: boolean;
  [key: string]: unknown;
}

const base = "/api/company_master";

export const companyService = {
  async fetchCompanies() {
    return httpRequest(`${base}/fetch_all_companies`);
  },

  async approveCompany(id: string) {
    return httpRequest(`${base}/approve_company?company_code=${encodeURIComponent(id)}`, { method: "GET" });
  },

  async toggleCompanyStatus(id: string, status: boolean) {
    const endpoint = status ? "enable_company" : "disable_company";
    return httpRequest(`${base}/${endpoint}?company_code=${encodeURIComponent(id)}`, { method: "GET" });
  },

  async deleteCompany(id: string) {
    return httpRequest(`${base}/delete_company?company_code=${encodeURIComponent(id)}`, { method: "GET" });
  },

  async updateProfile(payload: Partial<Company> | FormData) {
    return httpRequest(`${base}/update_company_profile`, { method: "POST", body: payload });
  },

  async addCompany(payload: FormData) {
    return httpRequest(`${base}/add_company`, { method: "POST", body: payload });
  },

  async updateCompany(payload: FormData) {
    return httpRequest(`${base}/update_company`, { method: "POST", body: payload });
  },
};
