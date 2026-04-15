import axios from 'axios';
import { apiConfig } from './config';

const api = axios.create({
    baseURL: apiConfig.additionalDataApiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

export type AdditionalDataHelperParams = {
    limit?: number;
    car_ids?: string;
    a_version?: number;
    job_id: string;
}

export const runAdditionalDataHelper = async (requestData: AdditionalDataHelperParams) => {
    const response = await api.post('/add', requestData);
    return response.data;
};
