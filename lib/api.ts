import { authService } from "./services/auth";
import { companyService } from "./services/company";
import { userService } from "./services/user";
import { superAdminService } from "./services/super-admin";
import { API_BASE_URL } from "./http-client";

export const resolveImageUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const authApi = {
  ...authService,
  ...companyService,
  ...userService,
  ...superAdminService,

  addUser: userService.addUser,
  updateUser: userService.updateUser,
  disableUser: userService.disableUser,
  enableUser: (email: string) => userService.toggleUserStatus(email, true),
  fetchUsers: userService.fetchUsers,

  addCompany: companyService.addCompany,
  updateCompany: companyService.updateCompany,
  updateCompanyProfile: companyService.updateProfile,
  disableCompany: (id: string) => companyService.toggleCompanyStatus(id, false),
  enableCompany: (id: string) => companyService.toggleCompanyStatus(id, true),
  fetchCompanyLogoUrl: (email: string) => `${API_BASE_URL}/api/company_master/fetch_company_logo_for_super_admin?company_owner_email=${encodeURIComponent(email)}`,
  fetchUserProfilePictureUrl: (email: string) => `${API_BASE_URL}/api/user_master/fetch_user_profile_picture?email=${encodeURIComponent(email)}`,
  fetchSuperAdminProfilePictureUrl: (email: string) => `${API_BASE_URL}/api/super_admin_master/fetch_super_admin_profile_picture?email=${encodeURIComponent(email)}`,
};

export const api = {
  auth: authService,
  company: companyService,
  user: userService,
  superAdmin: superAdminService,
};

export default api;
