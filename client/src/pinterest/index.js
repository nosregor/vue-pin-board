import axios from 'axios';
import { getHashParams } from '../utils';

const setLocalAccessToken = token => window.localStorage.setItem('pinterest_access_token', token);
const getLocalAccessToken = () => window.localStorage.getItem('pinterest_access_token');

// Get access token off of query params
export const getAccessToken = () => {
  const { error, access_token } = getHashParams();

  if (error) {
    console.error(error);
  }

  const localAccessToken = getLocalAccessToken();

  // If there is no access token in local storage, set it and return `access_token` from params
  if (!localAccessToken || localAccessToken === 'undefined') {
    setLocalAccessToken(access_token);
    return access_token;
  }

  return localAccessToken;
};

export const token = getAccessToken();

export const logout = () => {
  window.localStorage.removeItem('pinterest_access_token');
  window.location.reload();
};

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

const api = axios.create({
  baseURL: 'https://api.pinterest.com',
  headers,
});

const access_token = `?access_token=${token}&limit=100`;

export const getUser = () => api.get(`/v1/me/${access_token}&fields=id,first_name,last_name,username,counts,image`);

export const getUserBoards = () => api.get(`/v1/me/boards/${access_token}&fields=id,name,counts,image,url`);

export const getBoard = id => api.get(`/v1/boards/${id}/${access_token}&fields=id,name,description,counts,image,privacy,url`);

export const getBoardPins = id => api.get(`/v1/boards/${id}/pins/${access_token}&fields=id,link,url,board,color,counts,image`);

export const getPin = id => api.get(`/v1/pins/${id}/${access_token}&fields=id,board,color,counts,image,link,url`);
