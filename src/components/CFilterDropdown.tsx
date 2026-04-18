import { useEffect, useState } from "react";
import useClickOutside from "../hooks/useClickOutSide";
import "./CFilterDropdown.scss";
import { FaChevronDown } from "react-icons/fa";

export type CFilterDropdownOption = {
    key: string,
    value: string,
    displayText: string,
    onClick?: () => void,
}

type CFilterDropdownProps = {
    options?: CFilterDropdownOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
};

const CFilterDropdown = ({ options, value, onChange, placeholder }: CFilterDropdownProps) => {
    const [localValue, setLocalValue] = useState<string | undefined>("");
    const [isDropDownOpened, setIsDropDownOpened] = useState(false);
    const dropDownPanelRef = useClickOutside<HTMLDivElement>(() => {
        setIsDropDownOpened(false);
    });

    useEffect(() => {
        setLocalValue(value);
    }, [value])

    const handleOptionClick = (
        value: string,
        cb?: (value: string | number | readonly string[] | undefined) => void
    ) => {
        setIsDropDownOpened(false);
        if (localValue !== value) {
            setLocalValue(value);
            cb && cb(value);
            onChange && onChange(value);
        }
    }

    const getDisplayTextByValue = () => {
        if (!localValue && placeholder) return placeholder;
        return options?.find((o) => o.value === localValue)?.displayText || localValue;
    }

    return (
        <div className="c-filter-dropdown-container">
            <button className="c-filter-dropdown-button" onClick={() => setIsDropDownOpened(!isDropDownOpened)}>
                {`${getDisplayTextByValue()} `}<FaChevronDown />
            </button>
            {
                isDropDownOpened &&
                <div className="c-filter-dropdown-panel" ref={dropDownPanelRef}>
                    <ul>
                        {
                            options?.map((o) => (
                                <li key={o.key} value={o.value} onClick={() => handleOptionClick(o.value, o.onClick)}>{o.displayText}</li>
                            ))
                        }
                    </ul>
                </div>
            }
        </div>
    )
}

export default CFilterDropdown;
