import { getApiContext } from "./apiContext";

export const getBearerAuthHeaders = (tokenOverride?: string) => {
    const token = tokenOverride || getApiContext()?.getIdToken();

    return token
        ? {
            Authorization: `Bearer ${token}`,
        }
        : {};
};
