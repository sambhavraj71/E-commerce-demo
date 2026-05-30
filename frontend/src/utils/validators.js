export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

export const validatePassword = (password) => {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return re.test(password);
};

export const validatePincode = (pincode) => {
  const re = /^[0-9]{6}$/;
  return re.test(pincode);
};

export const validateName = (name) => {
  return name && name.length >= 2 && name.length <= 50;
};

export const validateCardNumber = (cardNumber) => {
  const re = /^[0-9]{16}$/;
  return re.test(cardNumber.replace(/\s/g, ''));
};

export const validateExpiryDate = (expiryDate) => {
  const re = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!re.test(expiryDate)) return false;
  
  const [month, year] = expiryDate.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month), 0);
  const now = new Date();
  
  return expiry > now;
};

export const validateCVV = (cvv) => {
  const re = /^[0-9]{3,4}$/;
  return re.test(cvv);
};