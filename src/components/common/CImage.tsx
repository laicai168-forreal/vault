import { useEffect, useState } from "react";
import "./CImage.scss";

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
        setImgSrc(src);
        setLoading(true);
    }, [src]);

    return (
        <div
            className={`c-image-wrapper ${className}`}
        >
            {loading && <div className="c-image-loading-overlay" />}
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

