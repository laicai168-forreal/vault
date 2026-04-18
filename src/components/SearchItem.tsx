import './SearchItem.scss';
import AddToGarageButton from "./AddToGarageButton";
import WantToGarageButton from "./WantToGarageButton";
import ViewCarDetailsButton from "./ViewCarDetailsButton";
import { CollectionEntry } from "../types/UserCollection";
import CImage from "./common/CImage";
import { getPrimaryWithAiFallback } from "../utils/carDisplay";

type PropsType = {
    img: string;
    brand: string;
    title: string;
    originalId: string;
    make?: string;
    makeAi?: string;
    releaseDateApproximate?: string;
    releaseDateAi?: string;
    carId?: string;
    own?: boolean;
    like?: boolean;
    loadingLike?: boolean,
    loadingAdd?: boolean,
    onAdd?: (addCollectionEntry: CollectionEntry) => void;
    onLike?: (addCollectionEntry: CollectionEntry) => void;
    onView?: (cid: string) => void;
    onSuggestEdit?: (cid: string) => void;
}

const SearchItem = ({
    img,
    brand,
    title,
    carId,
    originalId,
    make,
    makeAi,
    releaseDateApproximate,
    releaseDateAi,
    own,
    like,
    loadingLike = false,
    loadingAdd = false,
    onAdd,
    onLike,
    onView,
    onSuggestEdit,
}: PropsType) => {
    const makeDisplay = getPrimaryWithAiFallback(make, makeAi);
    const releaseDateDisplay = getPrimaryWithAiFallback(releaseDateApproximate, releaseDateAi);

    return (
        <div className={`search-item-container ${own ? 'owned' : ''}`}>
            <div className="image-wrapper" onClick={() => carId && onView && onView(carId)}>
                <img className="blur-background" src={img} alt="" />
                <CImage src={img} />
            </div>
            <div className="search-item-title" title={title}>
                <span className='search-item-title-brand'>{`${brand} `}</span>{title}
            </div>
            <div className="search-item-bottom">
                {(makeDisplay.value || releaseDateDisplay.value) && (
                    <div className="search-item-meta">
                        {makeDisplay.value && (
                            <div>
                                <span className="search-item-meta-label">Make:</span> {makeDisplay.value}
                                {makeDisplay.isAiFallback && <span className="search-item-ai-indicator">(AI generated)</span>}
                            </div>
                        )}
                        {releaseDateDisplay.value && (
                            <div>
                                <span className="search-item-meta-label">Release:</span> {releaseDateDisplay.value}
                                {releaseDateDisplay.isAiFallback && <span className="search-item-ai-indicator">(AI generated)</span>}
                            </div>
                        )}
                    </div>
                )}
                <div className="search-item-sku">
                    {originalId}
                </div>
                <button
                    type="button"
                    className="search-item-edit-link"
                    onClick={() => carId && onSuggestEdit && onSuggestEdit(carId)}
                >
                    Correct info
                </button>
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
