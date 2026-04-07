import { ChangeEvent, useCallback, useEffect, useState } from "react";
import "./CSearchInput.scss";
import { FaSearch } from "react-icons/fa";

type CSearchInputProps = {
    initialValue?: string;
    onClick?: (searchText: string) => void;
}

const CSearchInput = ({
    initialValue,
    onClick,
}: CSearchInputProps) => {
    const [searchText, setSearchText] = useState<string>('');
    const handleSearchTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    }, [])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onClick && onClick(searchText);
    }

    useEffect(() => {
        if (initialValue !== undefined) {
            setSearchText(initialValue);
        }
    }, [initialValue]);

    return (
        <div className="search-input-container">
            <form onSubmit={(e) => handleSubmit(e)}>
                <input name="search-input-input" className="search-input-input" value={searchText} onChange={handleSearchTextChange} />
                <button className="search-input-button" type="submit">
                    <FaSearch />
                </button>
            </form>
        </div>
    )
}

export default CSearchInput;