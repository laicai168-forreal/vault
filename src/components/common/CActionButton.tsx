import { ClipLoader } from 'react-spinners';
import './CActionButton.scss'
import { MouseEventHandler } from "react";

type CActionButtonProps = {
    loading?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
const CActionButton = ({
    type,
    title,
    className,
    children,
    disabled = false,
    loading = false,
    onClick
}: CActionButtonProps) => {
    return (
        <button
            className={`default-action-button${` ${className}`}`}
            disabled={disabled || loading}
            onClick={onClick}
            title={title}
            type={type}
        >
            {
                !loading && <>
                    <span className='action-button-icon'>{children}</span>
                </>
            }
            <ClipLoader
                loading={loading}
                color="#fff"
                size='0.5rem'
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </button>
    )
}

export default CActionButton;