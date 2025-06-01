
const isStrongPassword = (password) => {
 
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
};

module.exports = {
  isStrongPassword,
};