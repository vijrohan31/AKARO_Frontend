import { httpRequest } from "../http-client";

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  profile_picture?: string;
  [key: string]: unknown;
}

const base = "/api";

export const authService = {
  async login(payload: any) {
    const response = await httpRequest<any>(`${base}/login`, { method: "POST", body: payload });
    try {
      if (response.is_successful) {
        sessionStorage.setItem("akaro_verified_gate", response.is_verified ? "true" : "false");
        sessionStorage.removeItem("akaro_is_logged_out");
      }
    } catch (e) {}
    return response;
  },

  async signup(formData: FormData) {
    const response = await httpRequest<any>(`${base}/company_master/signup`, { method: "POST", body: formData });
    try {
      sessionStorage.removeItem("akaro_is_logged_out");
    } catch (e) {}
    return response;
  },

  async forgotPassword(email: string) {
    return httpRequest(`${base}/forgot_password`, { method: "POST", body: { email } });
  },

  async verifyOtp(email: string, otp: string) {
    return httpRequest(`${base}/verify_forgot_password_otp`, { method: "POST", body: { email, input_otp: otp } });
  },

  async updatePassword(payload: any) {
    return httpRequest(`${base}/update_password`, { method: "POST", body: payload });
  },

  async logout() {
    try {
      await httpRequest(`${base}/logout`, { method: "GET" });
    } finally {
      try {
        sessionStorage.setItem("akaro_is_logged_out", "true");
      } catch (e) {}
    }
  },

  async fetchProfile() {
    return httpRequest<UserProfile>(`${base}/fetch_profile`, { skipVerificationLock: true });
  },

  async fetchProfilePicture() {
    return httpRequest(`${base}/fetch_profile_picture`);
  },

  async checkBusinessEmail(email: string) {
    return httpRequest(`${base}/company_master/check_business_email?email=${encodeURIComponent(email)}`, { method: "GET" });
  },
  async resendVerificationEmail(email: string) {
    return httpRequest(`${base}/company_master/resend_verification_email?email=${encodeURIComponent(email)}`, { method: "GET", skipVerificationLock: true });
  },
};
