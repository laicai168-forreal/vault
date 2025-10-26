import React from "react";

interface ButtonProps {
    onClick?: () => void;
}

const DeleteToGarageButton = ({ onClick }: ButtonProps) => {
    return (
        <button onClick={onClick}>
            Delete
        </button>
    )
}

export default DeleteToGarageButton;