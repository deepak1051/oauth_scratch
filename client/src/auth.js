import api from './api';

export const getCurrentUser = async () => {
  try {
    const res = await api.get('/user/me');
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const logout = async () => {
  await api.post('/auth/logout');
};
