import CButton from "./common/CButton";
import "./DetailCard.scss";
import DetailImageViewer from "./DetailImageViewer";
import { FaRegStar, FaStar } from "react-icons/fa";
import { FaStore } from "react-icons/fa6";
import { BsBox2, BsBox2HeartFill } from "react-icons/bs";
import { CollectionEntry } from "../types/UserCollection";
import { getPrimaryWithAiFallback } from "../utils/carDisplay";

type DetailCardProps = {
    carId?: string;
    brand?: string;
    title?: string;
    own?: boolean;
    like?: boolean;
    images?: Array<{ s3_url: string, original_url: string }>;
    description?: string;
    make?: string;
    make_ai?: string;
    model_ai?: string;
    release_date_approximate?: string;
    release_date_ai?: string;
    loadingAdd?: boolean;
    loadingLike?: boolean;
    onAddCollection?: (addCollectionEntry: CollectionEntry) => void;
    onLikeCollection?: (addCollectionEntry: CollectionEntry) => void;
}

const DetailCard = ({
    carId,
    brand,
    title,
    own,
    like,
    images,
    description,
    make,
    make_ai,
    model_ai,
    release_date_approximate,
    release_date_ai,
    loadingAdd,
    loadingLike,
    onAddCollection,
    onLikeCollection,
}: DetailCardProps) => {
    const makeDisplay = getPrimaryWithAiFallback(make, make_ai);
    const releaseDateDisplay = getPrimaryWithAiFallback(release_date_approximate, release_date_ai);

    return (
        <div className="detail-card-container">
            <div className="detail-car-image-section">
                <DetailImageViewer images={images} />
            </div>
            <div className="detail-car-main-section">
                <h2>{`${brand || ''} ${title || ''}`}</h2>
                <p>{description}</p>
                <div className="detail-car-specs-section">
                    <div className="detail-car-specs-grid">
                        <table>
                            <thead>
                                <tr>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Make</td>
                                    <td>
                                        {makeDisplay.value || "-"}
                                        {makeDisplay.isAiFallback && <span className="detail-car-ai-indicator">(AI generated)</span>}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Model</td>
                                    <td>{model_ai}</td>
                                </tr>
                                <tr>
                                    <td>Item Release Date</td>
                                    <td>
                                        {releaseDateDisplay.value || "-"}
                                        {releaseDateDisplay.isAiFallback && <span className="detail-car-ai-indicator">(AI generated)</span>}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="detail-car-action-section">
                    <div className="detail-car-add-like-section">
                        <CButton
                            loading={loadingAdd}
                            onClick={() => carId && onAddCollection && onAddCollection({ carId })}
                            theme="icon-only"
                            title={own ? "I don't have this any more" : "Add to my collection"}
                        >
                            {own ? <BsBox2HeartFill className="detail-car-delete-button" fontSize='1.5rem' /> : <BsBox2 fontSize='1.5rem' />}
                        </CButton>
                        <CButton
                            loading={loadingLike}
                            onClick={() => carId && onLikeCollection && onLikeCollection({ carId })}
                            theme="icon-only"
                            title={like ? "Remove this from your likes" : "Add this to your likes"}
                        >
                            {like ? <FaStar className="detail-car-dislike-button" fontSize='1.5rem' /> : <FaRegStar fontSize='1.5rem' />}
                        </CButton>
                        <CButton
                            loading={loadingLike}
                            onClick={() => carId && onLikeCollection && onLikeCollection({ carId })}
                            theme="icon-only"
                            title={like ? "Remove this from your likes" : "Add this to your likes"}
                        >
                            {like ? <FaStore className="detail-car-dislike-button" fontSize='1.5rem' /> : <FaStore fontSize='1.5rem' />}
                        </CButton>
                    </div>
                    {/* <div>
                        <CButton className="detail-see-button" title="See buying options or whoever has this item">
                            Owners/Sellers
                        </CButton>
                    </div> */}
                </div>

            </div>
        </div>
    )
}

export default DetailCard;
