import "./CContainer.scss";

const CContainer = ({ children, className }: React.InputHTMLAttributes<HTMLDivElement>
) => {
    return (
        <div className={`ccontainer${className ? ` ${className}` : ''}`}>
            {children}
        </div>
    )

}

export default CContainer;