import axios from 'axios';
import { apiConfig } from './config';

const api = axios.create({
    baseURL: apiConfig.logApiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

interface PollingLogParams {
    jobId: string;
    lastTs: number;
}

export const pollCrawlerLog = async ({ jobId, lastTs }: PollingLogParams) => {
    const params: PollingLogParams = {
        jobId,
        lastTs,
    }
    const response = await api.get('/poll-crawler-logs', { params });
    return response.data;
};
