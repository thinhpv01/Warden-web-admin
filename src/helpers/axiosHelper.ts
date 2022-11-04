import { appConfig } from '@config';
import axios from 'axios';
import { set } from 'lodash';
import { toast } from 'react-toastify';
import { msalInstance } from 'src';

const DEFAULT_TIMEOUT = 5 * 60 * 1000;

export const AZURE_ID = 'azure.idToken';

const axiosInstant = axios.create({
    baseURL: appConfig.gateway.serviceUrl,
    timeout: DEFAULT_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        // Authorization: 'Bearer ' + sessionStorage.getItem(AZURE_ID),
    },
});

axiosInstant.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

axiosInstant.interceptors.response.use(
    (response) => {
        if (response.status === 401) {
            // Clear local storage, redirect back to login
            window.location.href = '/logout';
        }
        return response;
    },
    (error) => {
        toast.error(error?.response?.data?.message || error.message || 'Server error!');
        return Promise.reject(error);
    }
);

export default axiosInstant;
