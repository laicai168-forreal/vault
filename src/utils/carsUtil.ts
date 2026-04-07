export const getCarCfnUrlByS3Url = (s3Url: string | undefined, width?: number) => {
    return s3Url ? `https://d1iyu83jkaexuj.cloudfront.net/${s3Url.split('/').slice(-2).join('/')}${width ? `?width=${width}` : ''}` : undefined;
}