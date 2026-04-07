import axios from 'axios';

const api = axios.create({
    baseURL: 'https://mbgqdcalh6.execute-api.us-east-1.amazonaws.com/prod',
    headers: {
        'Content-Type': 'application/json',
    },
});

export type CrawlerParams = {
    max_pages?: number;
    version?: number;
    brand?: string;
    catalog_url?: string;
    job_id: string;
    product_urls?: string[];
    task_type?: string;  
    override?: boolean;
}

export const runMinigtTask = async (crawlerInput: CrawlerParams) => {
    const response = await api.post('/crawl_minigt', crawlerInput);
    return response.data;
};

export const runTarmacTask = async (crawlerInput: CrawlerParams) => {
    const response = await api.post('/crawl_tarmacworks', crawlerInput);
    return response.data;
};

export const runInnoTask = async (crawlerInput: CrawlerParams) => {
    const response = await api.post('/crawl_inno', crawlerInput);
    return response.data;
};

export const runPopraceTask = async (crawlerInput: CrawlerParams) => {
    const response = await api.post('/crawl_poprace', crawlerInput);
    return response.data;
};
