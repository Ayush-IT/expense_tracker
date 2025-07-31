import axios from 'axios';

import { BASe_URL } from './apiPaths';

const axiosInstance = axios.create({
    baseURL: BASe_URL,
    timeout : 10000, // Set a timeout of 10 seconds 
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

//Request interceptor

axiosInstance.interceptors.request.use(
    (config) => {
        // You can add any request modifications here
        // For example, adding an authorization accessToken
        const accessToken = localStorage.getItem('token');    
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


//Response interceptor

axiosInstance.interceptors.response.use(
    (response) => {
        // You can add any response modifications here
        return response;
    },
    (error) => {    
        // Handle errors globally
        if (error.response) {
          if(error.response.status === 401) {
              window.location.href = '/login'; // Redirect to login on 401 Unauthorized
          } else if (error.response.status === 500) {
              alert('You do not have permission to access this resource.');
              console.error('Server Error:', error.response.data);
          }
         } else if (error.code === 'ECONNABORTED') {
              alert('Request timed out. Please try again later.');
              console.error('Request Timeout Error:', error.message);
          }
           
          return Promise.reject(error.response.data);
        }     
);

export default axiosInstance;   