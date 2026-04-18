import { Backdrop, CircularProgress } from "@mui/material";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import { useNavigate } from "react-router-dom";
import CContainer from "../../components/common/CContainer";
import DetailCard from "../../components/DetailCard";
import CButton from "../../components/common/CButton";
import { BRAND_NAME } from "../../constants/brand";
import { getCarById, updateCurrentCar } from "../../store/cars/carsSlice";
import { AppDispatch, RootState } from "../../store/store";
import { addUserCollection, deleteUserCollection, dislikeUserCollection, likeUserCollection } from "../../store/userCollection/userCollectionSlice";
import { CollectionEntry } from "../../types/UserCollection";
import "./CarDetail.scss";



const CarDetail = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentCar, loading } = useSelector((state: RootState) => state.cars);
    const cid = useRef<string>(searchParams.get('cid') || '');

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
                    <div className="car-detail-actions">
                        <CButton
                            theme="mono"
                            onClick={() => navigate(`/cars/edit?actor=customer&intent=suggest&cid=${currentCar.id}`)}
                        >
                            Correct Info
                        </CButton>
                    </div>
                    {

                        <div key={currentCar.id}>
                            <DetailCard
                                carId={currentCar.id}
                                brand={BRAND_NAME[currentCar.brand]}
                                title={currentCar.title}
                                own={currentCar.own}
                                like={currentCar.liked}
                                images={currentCar.images}
                                description={currentCar.description_ai}
                                make={currentCar.make}
                                make_ai={currentCar.make_ai}
                                model_ai={currentCar.model_ai}
                                release_date_approximate={currentCar.release_date_approximate}
                                release_date_ai={currentCar.release_date_ai}
                                loadingAdd={currentCar.loadingAdd}
                                loadingLike={currentCar.loadingLike}
                                onAddCollection={currentCar.own ? handleDeleteCollection : handleAddCollection}
                                onLikeCollection={currentCar.liked ? handleDislikeCollection : handleLikeCollection}
                            />
                        </div>
                    }
                </>
            }

        </CContainer>
    )
}

export default CarDetail;
