import bcrypt from 'bcryptjs';

export const comparePassword = (
  inputPassword: string,
  userPassword: string,
) => {
  return bcrypt.compare(inputPassword, userPassword);
};
