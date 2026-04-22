const CAR_CDN_BASE_URL = "https://d1iyu83jkaexuj.cloudfront.net";

const buildSizedUrl = (path: string, width?: number) =>
    `${CAR_CDN_BASE_URL}/${path}${width ? `?width=${width}` : ""}`;

export const getCarCfnUrlByS3Url = (s3Url: string | undefined, width?: number) => {
    if (!s3Url) return undefined;

    try {
        const parsed = new URL(s3Url);
        const objectKey = parsed.pathname.replace(/^\/+/, "");
        if (!objectKey) return undefined;

        return buildSizedUrl(objectKey, width);
    } catch {
        // Some callers may already have a raw object key instead of a full URL.
        const objectKey = s3Url.replace(/^\/+/, "");
        if (!objectKey) return undefined;

        return buildSizedUrl(objectKey, width);
    }
};
