import CActionButton from "./common/CActionButton";
import { FaRegHeart, FaHeart } from "react-icons/fa";

interface ActionButtonProps {
    loading?: boolean;
    onClick?: () => void;
    like?: boolean;
}

const WantToGarageButton = ({
    loading = true,
    like = false,
    onClick,
}: ActionButtonProps) => {
    return (
        <CActionButton loading={loading} onClick={onClick}>
            {like ? <FaHeart title="Remove from likes" /> : <FaRegHeart title="Add to likes" />}
        </CActionButton>
    )
}

export default WantToGarageButton;