import React from "react";
import './SearchItem.scss';
import AddToGarageButton from "./AddToGarageButton";
import WantToGarageButton from "./WantToGarageButton";
import ViewCarDetailsButton from "./ViewCarDetailsButton";
import { AddCollectionEntity } from "../types/UserCollection";
import DeleteToGarageButton from "./DeleteToGarageButton";

type PropsType = {
    img: string;
    title: string;
    sku: string;
    own?: boolean;
    onAdd?: (addCollectionEntry: AddCollectionEntity) => void;
    onDelete?: (addCollectionEntry: AddCollectionEntity) => void;
}

const SearchItem = ({
    img,
    title,
    sku,
    own,
    onAdd,
    onDelete,
}: PropsType) => {
    return (
        <div className="search-item-container">
            <div className="image-wrapper">
                <img src={img}/>
            </div>
            <div>
                {title}
            </div>
            <div>
                {sku}
            </div>
            <div>
                {
                    own ? 
                    <DeleteToGarageButton onClick={() => onDelete ? onDelete({ carId: sku }) : () => {}}/>
                    : <AddToGarageButton onClick={() => onAdd ? onAdd({ carId: sku }) : () => {}}/>
                }
                <WantToGarageButton />
                <ViewCarDetailsButton />
            </div>
        </div>
    )
}

export default SearchItem;