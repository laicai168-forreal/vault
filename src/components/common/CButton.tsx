import { ClipLoader } from 'react-spinners';
import './CButton.scss'

type CButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    theme?: 'mono' | 'icon-only' | 'warn';
    loading?: boolean;
};

const CButton = ({
    className,
    type,
    title,
    children,
    theme,
    loading,
    disabled,
    onClick
}: CButtonProps) => {
    return (
        <button
            className={
                `default-button 
                ${className || ''}
                ${theme === 'mono' ? 'mono' : ''}
                ${theme === 'icon-only' ? 'icon-only' : ''}
                ${theme === 'warn' ? 'warn' : ''}`
            }
            title={title}
            onClick={onClick}
            type={type}
            disabled={disabled}
        >
            <div className={`c-button-content ${loading ? 'c-button-loading' : ''}`}>{children}</div>
            {
                loading &&
                <div className='c-button-spinner'>
                    <ClipLoader
                        loading={loading}
                        color="#000"
                        size='0.5rem'
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>
            }

        </button>
    )
}

export default CButton;