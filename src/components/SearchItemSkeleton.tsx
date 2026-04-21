import "./SearchItem.scss";

import CSkeleton from "./common/CSkeleton";

const SearchItemSkeleton = () => {
    return (
        <div className="search-item-container search-item-skeleton-container" aria-hidden="true">
            <div className="image-wrapper">
                <CSkeleton className="search-item-skeleton-image" />
            </div>
            <div className="search-item-title">
                <CSkeleton variant="text" className="search-item-skeleton-title-line search-item-skeleton-title-line-primary" />
                <CSkeleton variant="text" className="search-item-skeleton-title-line" />
                <CSkeleton variant="text" className="search-item-skeleton-title-line search-item-skeleton-title-line-short" />
            </div>
            <div className="search-item-bottom">
                <div className="search-item-meta">
                    <CSkeleton variant="text" className="search-item-skeleton-meta-line" />
                    <CSkeleton variant="text" className="search-item-skeleton-meta-line search-item-skeleton-meta-line-short" />
                </div>
                <CSkeleton variant="text" className="search-item-skeleton-sku" />
                <CSkeleton variant="text" className="search-item-skeleton-link" />
                <div className="search-item-actions">
                    <CSkeleton className="search-item-skeleton-button" />
                    <CSkeleton className="search-item-skeleton-button" />
                    <CSkeleton className="search-item-skeleton-button" />
                </div>
            </div>
        </div>
    );
};

export default SearchItemSkeleton;
