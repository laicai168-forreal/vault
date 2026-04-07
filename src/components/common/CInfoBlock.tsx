import './CInfoBlock.scss';
interface CInfoBlockProps extends React.PropsWithChildren {
    type?: string;
    show?: boolean;
}

const CInfoBlock = ({
    children,
    type,
    show,
}: CInfoBlockProps) => {
    return (
        <>
            {
                show &&
                <div className={`box ${type}`}>
                    {children}
                </div>
            }
        </>

    )
}

export default CInfoBlock;