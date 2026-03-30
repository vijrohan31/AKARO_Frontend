export const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const validatePassword = (pass: string) => {
  const hasUppercase = /[A-Z]/.test(pass);
  const hasLowercase = /[a-z]/.test(pass);
  const hasDigit = /\d/.test(pass);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
  const isLongEnough = pass.length >= 8;
  return hasUppercase && hasLowercase && hasDigit && hasSpecialChar && isLongEnough;
};

export const validatePhone = (phoneValue: string) => {
  return phoneValue && phoneValue.length >= 8;
};

export const formatNumericOnly = (value: any) => {
  return String(value || "").replace(/\D/g, "");
};
