import "./BrandBadge.scss";

interface BrandBadgeProps {
    image?: string;
    onClick?: () => void;
}
const BrandBadge = ({
    image,
    onClick,
}: BrandBadgeProps) => {
    return (
        <div className="brand-badge-container">
            <div className="hover" onClick={onClick}></div>
            <img className="logo" src={image} alt="" />
        </div>
    )
}

export default BrandBadge;