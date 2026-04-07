import React, { useState } from "react";
import "./CComboBox.scss";

type CComboBoxProps<T> = {
    value: string;
    options: T[];
    getLabel: (option: T) => string;
    getValue: (option: T) => string;
    placeholder?: string;
    onChange: (value: string) => void;
    onSelect: (option: T) => void;
};

function CComboBox<T>({
    value,
    options,
    getLabel,
    getValue,
    placeholder,
    onChange,
    onSelect,
}: CComboBoxProps<T>) {
    const [open, setOpen] = useState(false);

    const filtered = options.filter((o) =>
        getLabel(o).toLowerCase().includes(value.toLowerCase())
    );

    return (
        <div className="c-combobox">
            <input
                className="c-combobox__input"
                value={value}
                placeholder={placeholder}
                onChange={(e) => {
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 100)}
            />

            {open && filtered.length > 0 && (
                <ul className="c-combobox__dropdown">
                    {filtered.map((option) => (
                        <li
                            key={getValue(option)}
                            className="c-combobox__option"
                            onMouseDown={() => {
                                onSelect(option);
                                setOpen(false);
                            }}
                        >
                            {getLabel(option)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
  }

export default CComboBox;