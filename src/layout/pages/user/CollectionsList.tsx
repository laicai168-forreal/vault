import { Backdrop, CircularProgress, Modal, Pagination } from "@mui/material";
import dayjs from "dayjs";
import { FormEvent, useEffect, useState } from "react";
import { FaEdit, FaRegTrashAlt, FaSearch, FaLongArrowAltDown, FaLongArrowAltUp } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { createSearchParams, useNavigate, useSearchParams } from "react-router";
import defaultImage from '../../../assets/images/default_item_image.jpg';
import CButton from "../../../components/common/CButton";
import CImage from "../../../components/common/CImage";
import { AppDispatch, RootState } from "../../../store/store";
import { deleteUserCollection, deleteUserCollectionEntry, getUserCollection, getUserCollectionByCarId, getUserCollectionMetaData, updateUserCollection } from "../../../store/userCollection/userCollectionSlice";
import { getCarCfnUrlByS3Url } from "../../../utils/carsUtil";
import "./CollectionsList.scss";
import { CollectionEntry, GetUserCollectionParams } from "../../../types/UserCollection";
import { useAuthAction } from "../../../hooks/useAuthAction";
import { v4 as uuid } from "uuid";
import CollectionByCar from "../../../components/CollectionByCar";
import { BRAND_LOGO, BRAND_NAME } from "../../../constants/brand";
import CLoading from "../../../components/common/CLoading";

const CollectionsList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        loading,
        metadata,
        userCollectionsByPage,
        totalCollectionCount,
        totalCollectionPageCount,
        editingCar,
        entriesByCar,
    } = useSelector((state: RootState) => state.userCollection);
    const [searchParams, setSearchParams] = useSearchParams();
    const [keyword, setKeyword] = useState('');
    const [isCollectionByCarOpened, setIsCollectionByCarOpened] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(getUserCollectionMetaData({ metadata: true }))
            .unwrap()
            .catch((error) => {
                console.log(error);
                //TODO: log error 
            })
    }, []);

    useEffect(() => {
        const keyword = searchParams.get('keyword');
        const order = searchParams.get('order');
        const params: GetUserCollectionParams = {
            page: currentPage(searchParams),
        }
        if (keyword) {
            params.keyword = keyword;
            setKeyword(keyword);
        }
        if (order) params.order = order;

        dispatch(getUserCollection(params))
            .unwrap()
            .catch((error) => {
                console.log(error);
                //TODO: log error 
            })
    }, [searchParams]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setSearchParams((prev => {
            prev.set("page", page.toString());
            return prev;
        }))
    }

    const handleAddedChange = () => {
        setSearchParams(prev => {
            prev.set("order", searchParams.get('order') === 'asc' ? 'desc' : 'asc');
            return prev;
        })
    }

    const handleCollectionClick = (carId: string) => {
        // setIsCollectionByCarOpened(true);
        // dispatch(getUserCollectionByCarId({ carId }))
        //     .unwrap()
        //     .catch((error) => {
        //         console.log(error);
        //     });
        navigate({
            pathname: "/collection_detail",
            search: createSearchParams({
                cid: carId,
            }).toString(),
        });
    }

    const handleCollectionClose = () => {
        setIsCollectionByCarOpened(false);
    }

    const currentPage = (searchParams: URLSearchParams): number => parseInt(searchParams.get('page') || "1");
    const currentOrder = (searchParams: URLSearchParams): string => searchParams.get('order') || '';
    const orderArrow = (currentOrder: string) => {
        if (currentOrder === 'asc') return <FaLongArrowAltUp />;
        return <FaLongArrowAltDown />;
    }

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (keyword.length > 2) {
            setSearchParams((prev => {
                prev.set("keyword", keyword);
                return prev;
            }))
        }

        if (keyword.length === 0 && (searchParams.get('keyword') || '').length > 0) {
            searchParams.delete('keyword');
            setSearchParams(searchParams);
        }
    }

    const handleViewCar = (cid: string) => {
        navigate({
            pathname: "/car_detail",
            search: createSearchParams({ cid }).toString(),
        });
    };

    const handleViewBrand = (brand: string) => {
        navigate({
            pathname: "/cars",
            search: createSearchParams({ brand }).toString(),
        });
    }

    const handleDeleteCollection = useAuthAction((carId: string) => {
        dispatch(deleteUserCollection(carId))
            .unwrap()
            .then(() => {
                setSearchParams(prev => {
                    prev.set('action', uuid());
                    return prev;
                })
            })
            .catch((e) => {
                //TODO: Handle error
            })
    });

    const handleCollectionUpdate = useAuthAction((items: CollectionEntry[]) => {
        return dispatch(updateUserCollection({ items }))
            .unwrap();
    });

    const handleCollectionEntryDelete = useAuthAction((itemId: string, carId: string) => {
        return dispatch(deleteUserCollectionEntry({ itemId, carId }))
            .unwrap();
    });

    return (
        <div className="collection-page-shell">
            <CLoading loading={loading} />
            <Modal
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={isCollectionByCarOpened}
                onClose={handleCollectionClose}
            >
                <CollectionByCar
                    conditionTypes={metadata.conditionTypes}
                    storeLocations={metadata.locations}
                    car={editingCar}
                    items={entriesByCar}
                    onSave={handleCollectionUpdate}
                    onDelete={handleCollectionEntryDelete}
                />
            </Modal>
            <div className="collection-container">
                <h2 className="collection-container-title">
                    My Collections
                </h2>
                <div className="collection-table-container">
                    <div className="collection-table-top">
                        <span>Your Total Collections: {totalCollectionCount}</span>
                        <form className="c-input-with-icon" onSubmit={handleSearch}>
                            <span className="c-input-with-icon-icon">
                                <FaSearch />
                            </span>
                            <input
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                className="c-input-with-icon-input"
                                placeholder="Search Collection"
                            />
                        </form>
                    </div>
                    <div className="collection-table-content">
                        <table className="collection-management-table">
                            <thead>
                                <tr>
                                    <td>ID</td>
                                    <td>Brand</td>
                                    <td>Item</td>
                                    <td></td>
                                    <td className="cell-clickable" onClick={handleAddedChange}>
                                        <div className="cell-mutiple-item-row">
                                            <span>Added</span>
                                            {orderArrow(currentOrder(searchParams))}
                                        </div>
                                    </td>
                                    <td>Amount</td>
                                    <td>Action</td>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    userCollectionsByPage[currentPage(searchParams)]?.map((collection) => (
                                        <tr className="collection-management-row" key={collection.carId}>
                                            <td className="collection-table-id">
                                                {collection.originalId}
                                            </td>
                                            <td
                                                className="cell-clickable"
                                                onClick={() => handleViewBrand(collection.brand)}
                                            >
                                                <div className="collection-table-brand">
                                                    <img
                                                        src={BRAND_LOGO[collection.brand]}
                                                        className="collection-table-brand-image"
                                                        width={40}
                                                    />
                                                    <div className="collection-table-brand-name">
                                                        {BRAND_NAME[collection.brand]}
                                                    </div>
                                                </div>
                                            </td>
                                            <td
                                                className="cell-clickable"
                                                onClick={() => handleViewCar(collection.carId)}
                                            >
                                                <img
                                                    className="collection-table-image"
                                                    src={getCarCfnUrlByS3Url(collection.images?.[0]?.s3_url, 200) ?? defaultImage}
                                                    width={60}
                                                    height={40}
                                                />
                                            </td>
                                            <td
                                                className="cell-clickable"
                                                onClick={() => handleViewCar(collection.carId)}
                                            >
                                                {collection.title}
                                            </td>
                                            <td>
                                                {dayjs(collection.addedAt).format("MMM D, YYYY")}
                                            </td>
                                            <td>
                                                {collection.count}
                                            </td>
                                            <td>
                                                <div className="collection-table-action">
                                                    <CButton onClick={() => handleCollectionClick(collection.carId)}>
                                                        <FaEdit />
                                                    </CButton>
                                                    <CButton theme="warn" onClick={() => handleDeleteCollection(collection.carId)}>
                                                        <FaRegTrashAlt />
                                                    </CButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }

                            </tbody>
                        </table>
                    </div>
                    {
                        !loading &&
                        <div className="collection-pagination">
                            <Pagination
                                count={totalCollectionPageCount}
                                page={currentPage(searchParams)}
                                onChange={(event, page) => handlePageChange(event, page)}
                                variant="outlined"
                                shape="rounded"
                            />
                        </div>
                    }

                </div>
            </div>
        </div>
    )
}
export default CollectionsList;
