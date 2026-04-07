import CActionButton from "./common/CActionButton";
import { FaRegStar, FaStar } from "react-icons/fa";

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
            {like ? <FaStar title="Remove from likes" /> : <FaRegStar title="Add to likes" />}
        </CActionButton>
    )
}

export default WantToGarageButton;