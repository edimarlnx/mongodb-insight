import { Meteor } from 'meteor/meteor';

export const getEnvVar = (name, defaultValue = undefined) => {
  const value = process.env[name];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value || defaultValue;
};

export const ADMIN_USERNAME = getEnvVar('ADMIN_USERNAME', 'admin');
export const ADMIN_PASSWORD = getEnvVar('ADMIN_PASSWORD', 'admin'); 