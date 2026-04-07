import { CognitoAccessToken } from "amazon-cognito-identity-js";

type ApiContext = {
    getAccessToken: () => CognitoAccessToken | undefined;
};

let context: ApiContext;

export const initApi = (ctx: ApiContext) => {
    context = ctx;
};

export const getApiContext = () => context;