import { useEffect, useState } from "react";
import "./CImage.scss";
import "./CSkeleton.scss";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    alt?: string;
    className?: string;
    defaultImage?: string;
    objectFit?: React.CSSProperties["objectFit"];
};

export default function CImage({
    src, alt = "",
    defaultImage,
    className,
    objectFit,
}: Props) {
    const [imgSrc, setImgSrc] = useState(src);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const nextSrc = src || defaultImage || '';
        setImgSrc(nextSrc);

        if (!nextSrc) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const preloadImage = new Image();
        preloadImage.src = nextSrc;

        const handleLoad = () => setLoading(false);
        const handleError = () => {
            if (defaultImage && nextSrc !== defaultImage) {
                setImgSrc(defaultImage);
                const fallbackImage = new Image();
                fallbackImage.src = defaultImage;
                fallbackImage.onload = () => setLoading(false);
                fallbackImage.onerror = () => setLoading(false);
                return;
            }

            setLoading(false);
        };

        preloadImage.onload = handleLoad;
        preloadImage.onerror = handleError;

        if (preloadImage.complete) {
            setLoading(false);
        }

        return () => {
            preloadImage.onload = null;
            preloadImage.onerror = null;
        };
    }, [src]);

    return (
        <div
            className={`c-image-wrapper ${className}`}
        >
            {loading && <div className="c-image-loading-overlay c-skeleton" />}
            <img
                src={imgSrc ?? defaultImage}
                alt={alt}
                onLoad={() => setLoading(false)}
                onError={() => { setLoading(false); setImgSrc(defaultImage ?? '') }}
                style={{
                    display: loading ? "none" : "block",
                    ...(objectFit && { objectFit: objectFit })
                }}
            />
        </div>
    );
}
