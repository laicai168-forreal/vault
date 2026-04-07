import axios from 'axios';

const api = axios.create({
    baseURL: 'https://e1pmpa39l8.execute-api.us-east-1.amazonaws.com/prod',
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

