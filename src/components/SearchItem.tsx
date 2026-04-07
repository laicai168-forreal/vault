import './SearchItem.scss';
import AddToGarageButton from "./AddToGarageButton";
import WantToGarageButton from "./WantToGarageButton";
import ViewCarDetailsButton from "./ViewCarDetailsButton";
import { CollectionEntry } from "../types/UserCollection";
import CImage from "./common/CImage";

type PropsType = {
    img: string;
    brand: string;
    title: string;
    originalId: string;
    carId?: string;
    own?: boolean;
    like?: boolean;
    loadingLike?: boolean,
    loadingAdd?: boolean,
    onAdd?: (addCollectionEntry: CollectionEntry) => void;
    onLike?: (addCollectionEntry: CollectionEntry) => void;
    onView?: (cid: string) => void;
}

const SearchItem = ({
    img,
    brand,
    title,
    carId,
    originalId,
    own,
    like,
    loadingLike = false,
    loadingAdd = false,
    onAdd,
    onLike,
    onView,
}: PropsType) => {
    return (
        <div className={`search-item-container ${own ? 'owned' : ''}`}>
            <div className="image-wrapper" onClick={() => carId && onView && onView(carId)}>
                <img className="blur-background" src={img} />
                <CImage src={img} />
            </div>
            <div className="search-item-title" title={title}>
                <span className='search-item-title-brand'>{`${brand} `}</span>{title}
            </div>
            <div className="search-item-bottom">
                <div className="search-item-sku">
                    {originalId}
                </div>
                <div className="search-item-actions">
                    <AddToGarageButton
                        own={own}
                        onClick={() => onAdd && carId ? onAdd({ carId }) : () => { }}
                        loading={loadingAdd}
                    />
                    <WantToGarageButton
                        like={like}
                        loading={loadingLike}
                        onClick={() => onLike && carId ? onLike({ carId }) : () => { }}
                    />
                    <ViewCarDetailsButton onClick={() => carId && onView && onView(carId)} />
                </div>
            </div>
        </div>
    )
}

export default SearchItem;