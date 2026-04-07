import React from "react";
import CActionButton from "./common/CActionButton";
import { BsBox2, BsBox2HeartFill } from "react-icons/bs";

interface ButtonProps {
    onClick?: () => void;
    loading?: boolean;
    own?: boolean;
}

const AddToGarageButton = ({
    onClick,
    loading = false,
    own,
}: ButtonProps) => {
    return (
        <CActionButton disabled={loading} loading={loading} title="Add to garage" onClick={onClick}>
            {own ? <BsBox2HeartFill title="Remove from likes" /> : <BsBox2 title="Add to likes" />}
        </CActionButton>
    )
}

export default AddToGarageButton;