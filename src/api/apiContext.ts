type ApiContext = {
    getAccessToken: () => string | undefined;
    getIdToken: () => string | undefined;
};

let context: ApiContext;

export const initApi = (ctx: ApiContext) => {
    context = ctx;
};

export const getApiContext = () => context;
