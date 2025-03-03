import Vue from 'vue';

export const authStore = Vue.observable({
  authToken: localStorage.getItem('authToken') || null,
  user: JSON.parse(localStorage.getItem('user')) || null
});

export const mutations = {
  setAuthToken(token) {
    authStore.authToken = token;
    localStorage.setItem('authToken', token);
  },
  setUser(userData) {
    authStore.user = userData;
    localStorage.setItem('user', JSON.stringify(userData));
  },
  clearAuth() {
    authStore.authToken = null;
    authStore.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};
