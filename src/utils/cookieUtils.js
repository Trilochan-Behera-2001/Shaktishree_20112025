

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};


export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};


export const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};


export const hasCookie = (name) => {
  return getCookie(name) !== null;
};


export const getJwtToken = () => {
  return getCookie('jwtToken');
};


export const setJwtToken = (token, days = 7) => {
  setCookie('jwtToken', token, days);
};


export const removeJwtToken = () => {
  removeCookie('jwtToken');
};