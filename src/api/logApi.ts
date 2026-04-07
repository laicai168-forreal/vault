import axios from 'axios';

const api = axios.create({
    baseURL: 'https://fjzq2z0gae.execute-api.us-east-1.amazonaws.com/prod/',
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
