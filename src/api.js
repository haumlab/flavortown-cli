const axios = require('axios');
const config = require('./config');

const BASE_URL = 'https://flavortown.hackclub.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((req) => {
  const apiKey = config.getApiKey();
  if (apiKey) {
    req.headers['Authorization'] = `Bearer ${apiKey}`;
  }
  return req;
});

const getProjects = async (page, query) => {
  const response = await api.get('/projects', { params: { page, query } });
  return response.data;
};

const getProject = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

const getDevlogs = async (projectId, page) => {
  const response = await api.get(`/projects/${projectId}/devlogs`, { params: { page } });
  return response.data;
};

const getDevlog = async (projectId, id) => {
  const response = await api.get(`/projects/${projectId}/devlogs/${id}`);
  return response.data;
};

const getStoreItems = async () => {
  const response = await api.get('/store');
  return response.data;
};

const getStoreItem = async (id) => {
  const response = await api.get(`/store/${id}`);
  return response.data;
};

module.exports = {
  getProjects,
  getProject,
  getDevlogs,
  getDevlog,
  getStoreItems,
  getStoreItem,
};
