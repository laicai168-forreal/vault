import { Backdrop, CircularProgress, Pagination } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { fetchCarOwners, CarOwner } from "../../api/carApi";
import defaultAvatar from "../../assets/images/default-avatar.jpg";
import CContainer from "../../components/common/CContainer";
import DetailCard from "../../components/DetailCard";
import { BRAND_NAME } from "../../constants/brand";
import { getCarById, updateCurrentCar } from "../../store/cars/carsSlice";
import { AppDispatch, RootState } from "../../store/store";
import { addUserCollection, deleteUserCollection, dislikeUserCollection, likeUserCollection } from "../../store/userCollection/userCollectionSlice";
import { CollectionEntry } from "../../types/UserCollection";
import "./CarDetail.scss";
import CButton from "../../components/common/CButton";



const CarDetail = () => {
    const OWNER_PAGE_LIMIT = 12;
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentCar, loading } = useSelector((state: RootState) => state.cars);
    const cid = useRef<string>(searchParams.get('cid') || '');
    const [isOwnersOpen, setIsOwnersOpen] = useState(false);
    const [owners, setOwners] = useState<CarOwner[]>([]);
    const [ownersLoading, setOwnersLoading] = useState(false);
    const [ownersError, setOwnersError] = useState<string | null>(null);
    const [ownersPage, setOwnersPage] = useState(1);

    const handleAddCollection = useCallback((entity: CollectionEntry) => {
        dispatch(updateCurrentCar({ loadingAdd: true }));
        dispatch(addUserCollection({ items: [entity] }))
            .unwrap()
            .then(() => {
                dispatch(updateCurrentCar({ own: true, loadingAdd: false }))
            }).catch((e) => {
                //TODO: Handle error
                dispatch(updateCurrentCar({ loadingAdd: false }))
            })
    }, [dispatch]);

    const handleDeleteCollection = useCallback((entity: CollectionEntry) => {
        if (!entity.carId) return;
        dispatch(updateCurrentCar({ loadingAdd: true }));
        dispatch(deleteUserCollection(entity.carId))
            .unwrap()
            .then(() => {
                dispatch(updateCurrentCar({ own: false, loadingAdd: false }))
            }).catch((e) => {
                //TODO: Handle error
                dispatch(updateCurrentCar({ loadingAdd: false }))
            })
    }, [dispatch]);

    const handleLikeCollection = useCallback((entity: CollectionEntry) => {
        dispatch(updateCurrentCar({ loadingLike: true }));
        dispatch(likeUserCollection(entity))
            .unwrap()
            .then(() => {
                dispatch(updateCurrentCar({ liked: true, loadingLike: false }))
            }).catch((e) => {
                //TODO: Handle error
                dispatch(updateCurrentCar({ loadingLike: false }))
            })
    }, [dispatch]);

    const handleDislikeCollection = useCallback((entity: CollectionEntry) => {
        if (!entity.carId) return;

        dispatch(updateCurrentCar({ loadingLike: true }));
        dispatch(dislikeUserCollection(entity.carId))
            .unwrap()
            .then(() => {
                dispatch(updateCurrentCar({ liked: false, loadingLike: false }))
            }).catch((e) => {
                //TODO: Handle error
                dispatch(updateCurrentCar({ loadingLike: false }))
            })
    }, [dispatch]);

    useEffect(() => {
        dispatch(getCarById(cid.current))
    }, [dispatch]);

    useEffect(() => {
        if (!isOwnersOpen || !cid.current) return;

        setOwnersLoading(true);
        setOwnersError(null);

        fetchCarOwners(cid.current, {
            limit: OWNER_PAGE_LIMIT,
            offset: (ownersPage - 1) * OWNER_PAGE_LIMIT,
        })
            .then((response) => {
                setOwners(response.items || []);
            })
            .catch((error: Error) => {
                setOwnersError(error.message || "Unable to load owners.");
            })
            .finally(() => {
                setOwnersLoading(false);
            });
    }, [isOwnersOpen, ownersPage]);

    const ownerPreview = currentCar?.owners_preview || [];
    const ownersCount = currentCar?.owners_count || 0;
    const ownerPages = Math.max(1, Math.ceil(ownersCount / OWNER_PAGE_LIMIT));

    return (
        <CContainer className="car-detail-container">
            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            {
                !cid && "No item specified"
            }
            {
                currentCar &&
                <>
                    <div key={currentCar.id}>
                        <DetailCard
                            carId={currentCar.id}
                            brand={BRAND_NAME[currentCar.brand]}
                            brandKey={currentCar.brand}
                            title={currentCar.title}
                            own={currentCar.own}
                            like={currentCar.liked}
                            images={currentCar.images}
                            description={currentCar.description_ai}
                            make={currentCar.make}
                            make_ai={currentCar.make_ai}
                            model_ai={currentCar.model_ai}
                            product_line={currentCar.product_line}
                            release_date_approximate={currentCar.release_date_approximate}
                            release_date_ai={currentCar.release_date_ai}
                            loadingAdd={currentCar.loadingAdd}
                            loadingLike={currentCar.loadingLike}
                            onCorrectInfo={() => navigate(`/cars/edit?actor=customer&intent=suggest&cid=${currentCar.id}`)}
                            onAddCollection={currentCar.own ? handleDeleteCollection : handleAddCollection}
                            onLikeCollection={currentCar.liked ? handleDislikeCollection : handleLikeCollection}
                        />
                    </div>

                    <section className="car-detail-owners-section">
                        <div className="car-detail-owners-header">
                            <div>
                                <h3>Collectors</h3>
                                <p>
                                    {ownersCount > 0
                                        ? `${ownersCount} user${ownersCount === 1 ? '' : 's'} currently own this model.`
                                        : 'No owners have added this model yet.'}
                                </p>
                            </div>
                            {ownersCount > 0 && (
                                <CButton
                                    theme="outline-primary"
                                    onClick={() => {
                                        setIsOwnersOpen((current) => !current);
                                        setOwnersPage(1);
                                    }}
                                >
                                    {isOwnersOpen ? "Hide Owners" : "View Owners"}
                                </CButton>
                            )}
                        </div>

                        {ownersCount > 0 && (
                            <button
                                type="button"
                                className="car-detail-owners-preview"
                                onClick={() => setIsOwnersOpen((current) => !current)}
                            >
                                <div className="car-detail-owner-avatars">
                                    {ownerPreview.slice(0, 5).map((owner) => (
                                        <img
                                            key={owner.id}
                                            className="car-detail-owner-avatar"
                                            src={owner.profile_image_url || defaultAvatar}
                                            alt={owner.username ? `${owner.username} profile` : "Collector profile"}
                                        />
                                    ))}
                                </div>
                                <span className="car-detail-owners-preview-copy">
                                    {ownersCount > 5 ? `See all ${ownersCount} owners` : "See owners"}
                                </span>
                            </button>
                        )}

                        {isOwnersOpen && ownersCount > 0 && (
                            <div className="car-detail-owners-panel">
                                {ownersLoading && (
                                    <div className="car-detail-owners-state">
                                        <CircularProgress size={22} />
                                        <span>Loading owners...</span>
                                    </div>
                                )}

                                {ownersError && <div className="car-detail-owners-error">{ownersError}</div>}

                                {!ownersLoading && !ownersError && (
                                    <>
                                        <div className="car-detail-owners-list">
                                            {owners.map((owner) => (
                                                <button
                                                    key={owner.id}
                                                    type="button"
                                                    className="car-detail-owner-row"
                                                    onClick={() => navigate(`/users/${owner.id}`)}
                                                >
                                                    <img
                                                        className="car-detail-owner-row-avatar"
                                                        src={owner.profile_image_url || defaultAvatar}
                                                        alt={owner.username ? `${owner.username} profile` : "Collector profile"}
                                                    />
                                                    <div className="car-detail-owner-row-copy">
                                                        <strong>{owner.username || "Collector"}</strong>
                                                        <span>
                                                            {owner.latest_owned_at
                                                                ? `Added ${new Date(owner.latest_owned_at).toLocaleDateString()}`
                                                                : "Recently added"}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {ownerPages > 1 && (
                                            <Pagination
                                                count={ownerPages}
                                                page={ownersPage}
                                                onChange={(_, page) => setOwnersPage(page)}
                                                variant="outlined"
                                                shape="rounded"
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </section>
                </>
            }

        </CContainer>
    )
}

export default CarDetail;
