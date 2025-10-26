import React from "react";

interface ButtonProps {
    onClick?: () => void;
}

const AddToGarageButton = ({ onClick }: ButtonProps) => {
    return (
        <button onClick={onClick}>
            Add
        </button>
    )
}

export default AddToGarageButton;