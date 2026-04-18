import './Cinput.scss';

type CInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
    value?: string;
    label?: string;
    name?: string;
    type?: React.HTMLInputTypeAttribute | undefined;
    fieldKey?: string | undefined;
    onChange?: (inValue: Record<string, string> | string) => void;
    multiline?: boolean;
    rows?: number;
}

const CInput = ({
    value,
    label,
    type,
    name,
    fieldKey,
    placeholder,
    onChange = () => { },
    multiline = false,
    rows = 4,
    disabled,
    ...rest
}: CInputProps) => {
    return (
        <div className="form-row">
            <label className="form-label">{label}</label>
            {
                multiline ? (
                    <textarea
                        className='form-input form-textarea'
                        name={name}
                        value={value}
                        rows={rows}
                        placeholder={placeholder}
                        disabled={disabled}
                        onChange={e => onChange(fieldKey ? { [fieldKey]: e.target.value } : e.target.value)}
                    />
                ) : (
                    <input
                        className='form-input'
                        type={type}
                        name={name}
                        value={value}
                        placeholder={placeholder}
                        disabled={disabled}
                        onChange={e => onChange(fieldKey ? { [fieldKey]: e.target.value } : e.target.value)}
                        {...rest}
                    />
                )
            }
        </div>
    )
}

export default CInput;
