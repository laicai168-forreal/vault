import './Cinput.scss';

type CInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    value?: string;
    label?: string;
    name?: string;
    type?: React.HTMLInputTypeAttribute | undefined;
    fieldKey?: string | undefined;
    onChange?: (inValue: Record<string, string> | string) => void;
}

const CInput = ({
    value,
    label,
    type,
    name,
    fieldKey,
    placeholder,
    onChange = () => { },
}: CInputProps) => {
    return (
        <div className="form-row">
            <label className="form-label">{label}</label>
            <input
                className='form-input'
                type={type}
                name={name}
                value={value}
                placeholder={placeholder}
                onChange={e => onChange(fieldKey ? { [fieldKey]: e.target.value } : e.target.value)}
            />
        </div>
    )
}

export default CInput;