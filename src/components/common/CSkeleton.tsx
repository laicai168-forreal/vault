import "./CSkeleton.scss";

type CSkeletonProps = {
    className?: string;
    variant?: "text" | "rect" | "circle";
};

const CSkeleton = ({ className = "", variant = "rect" }: CSkeletonProps) => {
    return <div className={`c-skeleton c-skeleton-${variant} ${className}`.trim()} aria-hidden="true" />;
};

export default CSkeleton;
