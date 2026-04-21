type ApiContext = {
    // The app standardizes on the ID token for authenticated API calls because
    // the current backend reads user identity claims from that JWT.
    getIdToken: () => string | undefined;
};

let context: ApiContext;

export const initApi = (ctx: ApiContext) => {
    context = ctx;
};

export const getApiContext = () => context;
