const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getApiBaseUrl = (envValue: string | undefined, fallback: string) =>
    trimTrailingSlash(envValue || fallback);

export const apiConfig = {
    carApiBaseUrl: getApiBaseUrl(
        process.env.REACT_APP_CAR_API_BASE_URL,
        'https://q83gsutz70.execute-api.us-east-1.amazonaws.com/prod'
    ),
    collectionApiBaseUrl: getApiBaseUrl(
        process.env.REACT_APP_COLLECTION_API_BASE_URL,
        'https://29367920u8.execute-api.us-east-1.amazonaws.com'
    ),
    userApiBaseUrl: getApiBaseUrl(
        process.env.REACT_APP_USER_API_BASE_URL,
        process.env.REACT_APP_COLLECTION_API_BASE_URL || 'https://29367920u8.execute-api.us-east-1.amazonaws.com'
    ),
    additionalDataApiBaseUrl: getApiBaseUrl(
        process.env.REACT_APP_ADDITIONAL_DATA_API_BASE_URL,
        'https://e1pmpa39l8.execute-api.us-east-1.amazonaws.com/prod'
    ),
    crawlerApiBaseUrl: getApiBaseUrl(
        process.env.REACT_APP_CRAWLER_API_BASE_URL,
        'https://mbgqdcalh6.execute-api.us-east-1.amazonaws.com/prod'
    ),
    logApiBaseUrl: getApiBaseUrl(
        process.env.REACT_APP_LOG_API_BASE_URL,
        'https://fjzq2z0gae.execute-api.us-east-1.amazonaws.com/prod'
    ),
};
