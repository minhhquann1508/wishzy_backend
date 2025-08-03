import bcrypt from 'bcryptjs';

export const comparePassword = async (
  inputPassword: string,
  userPassword: string,
) => {
  return await bcrypt.compare(inputPassword, userPassword);
};
