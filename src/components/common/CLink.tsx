import "./CLink.scss";

type CLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

const CLink = (props: CLinkProps) => {
    const {
        children
    } = props
    return <a {...props} className="c-link">
        {children}
    </a>
}

export default CLink;