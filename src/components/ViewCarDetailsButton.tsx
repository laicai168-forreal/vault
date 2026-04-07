import CActionButton from "./common/CActionButton";
import { GrView } from "react-icons/gr";

type ViewCarDetailsButtonProps = React.HTMLAttributes<HTMLButtonElement>;

const ViewCarDetailsButton = ({
    onClick
}: ViewCarDetailsButtonProps) => {
    return (
        <CActionButton title="View details" onClick={onClick}>
            <GrView />
        </CActionButton>
    )
}

export default ViewCarDetailsButton;