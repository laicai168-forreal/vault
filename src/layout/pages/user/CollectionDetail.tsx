import { ChangeEvent, useEffect, useState } from "react";
import { CollectionEntry, StorageLocation } from "../../../types/UserCollection";
import { BRAND_LOGO, BRAND_NAME } from "../../../constants/brand";
import { getCarCfnUrlByS3Url } from "../../../utils/carsUtil";
import CButton from "../../../components/common/CButton";
import { CollectionEntryForm } from "../../../components/CollectionByCar";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import defaultImage from '../../../assets/images/default_item_image.jpg';
import { useNavigate, useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { deleteUserCollectionEntry, getUserCollectionByCarId, getUserCollectionMetaData, updateUserCollection } from '../../../store/userCollection/userCollectionSlice';
import { AppDispatch, RootState } from "../../../store/store";
import { useAuthAction } from "../../../hooks/useAuthAction";
import "./CollectionDetail.scss";
import CLoading from "../../../components/common/CLoading";

interface CollectionByCarProps {
    items?: CollectionEntry[];
    onSave?: (items: CollectionEntry[]) => void
    onDelete?: (itemId: string, carId: string) => void
}

const CollectionDetail = ({
    items = [],
}: CollectionByCarProps) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const carId = searchParams.get('cid') || '';
    const {
        loading,
        metadata: { conditionTypes = [], locations: storeLocations = [] },
        editingCar,
        entriesByCar,
    } = useSelector((state: RootState) => state.userCollection);

    const [localItems, setLocalItems] = useState(items);
    const [originalItems, setOriginalItems] = useState(items);
    const [changedMap, setChangedMap] = useState(new Set());
    const [changedFieldsMap, setChangedFieldsMap] = useState(
        new Map<string, Set<string>>()
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [indexInputValue, setIndexInputValue] = useState(String(currentIndex + 1));
    const currentItem = localItems[currentIndex];
    const isChanged = currentItem && changedMap.has(currentItem.itemId);
    const changedFields = currentItem && currentItem.itemId ? changedFieldsMap.get(currentItem.itemId) ?? new Set<string>() : new Set<string>();

    useEffect(() => {
        if (!carId) return;

        dispatch(getUserCollectionByCarId({ carId }))
            .unwrap()
            .catch(console.error);
    }, [carId]);

    useEffect(() => {
        setLocalItems(entriesByCar);
        setOriginalItems(entriesByCar);
        setChangedMap(new Set());
        setChangedFieldsMap(new Map());
        setCurrentIndex(0);
    }, [entriesByCar]);

    // Sync index input with current index
    useEffect(() => {
        setIndexInputValue(String(currentIndex + 1));
    }, [currentIndex]);

    // Sync current index with local items length to prevent out of bound index after deletion
    useEffect(() => {
        if (currentIndex >= localItems.length - 1) {
            setCurrentIndex(localItems.length - 1);
        }
    }, [localItems]);

    useEffect(() => {
        dispatch(getUserCollectionMetaData({ metadata: true }))
            .unwrap()
            .catch((error) => {
                console.log(error);
                //TODO: log error 
            })
    }, []);

    const getChangedFields = (original?: CollectionEntry, current?: CollectionEntry) => {
        const changed = new Set<string>();

        if (!original || !current) return changed;

        const keys = Array.from(
            new Set([
                ...Object.keys(original),
                ...Object.keys(current),
            ])
        ) as (keyof CollectionEntry)[];

        keys.forEach((key) => {
            if (!isEqual(original[key], current[key])) {
                changed.add(key as string);
            }
        });

        return changed;
    };

    const handleEntryChange = (entry: CollectionEntry) => {
        setLocalItems(prev => {
            const updated = prev.map(li =>
                li.itemId === entry.itemId ? { ...entry } : li
            );

            const original = originalItems.find(o => o.itemId === entry.itemId);

            const changedFields = getChangedFields(original, entry);

            setChangedMap(prevSet => {
                const newSet = new Set(prevSet);

                if (changedFields.size > 0) {
                    newSet.add(entry.itemId);
                } else {
                    newSet.delete(entry.itemId);
                }

                return newSet;
            });

            setChangedFieldsMap(prevMap => {
                const newMap = new Map(prevMap);
                if (entry.itemId) {
                    if (changedFields.size > 0) {
                        newMap.set(entry.itemId, changedFields);
                    } else {
                        newMap.delete(entry.itemId);
                    }
                }

                return newMap;
            });

            return updated;
        });
    };

    const normalize = (value: any) => {
        if (value === null || value === undefined) return "";
        return value;
    };

    const isEqual = (a: any, b: any) => {
        return normalize(a) === normalize(b);
    };

    const handleSave = async () => {
        try {
            await handleCollectionUpdate(localItems);
            setOriginalItems(localItems);
            setChangedMap(new Set());
            setChangedFieldsMap(new Map<string, Set<string>>())
        } catch (e) {
            // TODO: error handling
        }
    };

    const handleAdd = async () => {
        if (editingCar) {
            try {
                let newItem: CollectionEntry = { carId: editingCar.id };
                const result = await handleCollectionUpdate([newItem]);
                console.log('update result: ', result);
                newItem = { ...newItem, itemId: result.data.created[0].id };
                setLocalItems(prev => [...prev, newItem])
                setOriginalItems(prev => [...prev, newItem]);
            } catch (e) {
                // TODO: error handling
            }
        } else {
            // TODO: No car info is available
        }
    }

    const handleDelete = async (itemId: string) => {
        if (editingCar) {
            try {
                await handleCollectionEntryDelete(itemId, editingCar.id);
                setLocalItems(prev => prev.filter(i => i.itemId !== itemId));
                setOriginalItems(prev => prev.filter(i => i.itemId !== itemId));
            } catch (e) {
                // TODO: error handling
            }
        } else {
            // TODO: No car info is available
        }

    }

    const handleCollectionUpdate = useAuthAction((items: CollectionEntry[]) => {
        return dispatch(updateUserCollection({ items }))
            .unwrap();
    });

    const handleCollectionEntryDelete = useAuthAction((itemId: string, carId: string) => {
        return dispatch(deleteUserCollectionEntry({ itemId, carId }))
            .unwrap();
    });

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    }

    const handleNext = () => {
        if (currentIndex < localItems.length - 1) setCurrentIndex(prev => prev + 1);
    }

    const handleIndexChange = (e: ChangeEvent<HTMLInputElement>) => {
        setIndexInputValue(e.target.value);
    };

    const handleIndexBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { value, min, max } = e.target;

        const parsed = Number(value);
        const parsedMin = Number(min);
        const parsedMax = Number(max);

        if (
            value === "" ||
            !Number.isInteger(parsed) ||
            parsed < parsedMin
        ) {
            setIndexInputValue(String(currentIndex + 1));
        } else if (parsed > parsedMax) {
            setIndexInputValue(String(parsedMax))
            setCurrentIndex(parsedMax - 1);
        } else {
            setCurrentIndex(parsed - 1);
        }
    };

    return (
        <div className="collection-by-car-container">
            <CLoading loading={loading} />
            <div className="collection-by-car-header">
                <div className="collection-by-car-title">
                    <div className="collection-by-car-image-wrapper">
                        <img className="collection-by-car-image" src={BRAND_LOGO[editingCar?.brand ?? '']} />
                    </div>
                    <hr />
                    <div className="collection-by-car-image-wrapper">
                        <img
                            className="collection-by-car-image"
                            src={getCarCfnUrlByS3Url(editingCar?.images?.[0]?.s3_url, 200) ?? defaultImage
                            }
                        />
                    </div>
                    <div className="collection-by-car-title-text">
                        <h3 className="collection-by-car-title-text-top">
                            [{BRAND_NAME[editingCar?.brand ?? ''] ?? "Unkown"}] {editingCar?.title}
                        </h3>
                        <div>
                            Product Id: {editingCar?.originalId || ''}
                        </div>
                    </div>
                </div>
            </div>
            <div className="collection-by-car-content">
                {
                    currentItem &&
                    <CollectionEntryForm
                        key={currentItem.itemId}
                        conditionTypes={conditionTypes}
                        storeLocations={storeLocations}
                        item={currentItem}
                        isChanged={isChanged}
                        changedFields={changedFields}
                        allowDeletion={localItems.length > 1}
                        onChange={handleEntryChange}
                        onDelete={handleDelete}
                    />
                }
            </div>
            <div className="collection-by-car-actions">
                {
                    localItems.length > 1 &&
                    <div className="collection-by-car-pagination">
                        <>
                            <CButton theme="icon-only" onClick={handlePrev} disabled={currentIndex === 0}>
                                <FaAngleLeft />
                            </CButton>
                            <input
                                style={{
                                    width: `${Math.max(indexInputValue.length, 1)}ch`,
                                }}
                                className="index-input"
                                max={localItems.length}
                                min={1}
                                value={indexInputValue}
                                onChange={handleIndexChange}
                                onBlur={handleIndexBlur}
                                inputMode="numeric"
                            />/
                            <span className="total-index">{localItems.length}</span>
                            <CButton theme="icon-only" onClick={handleNext} disabled={currentIndex === localItems.length - 1}>
                                <FaAngleRight />
                            </CButton>
                        </>
                    </div>
                }
                <div className="collection-by-car-buttons">
                    <CButton onClick={handleAdd}> Add Entry</CButton>
                    <CButton onClick={handleSave} disabled={changedMap.size === 0}>Save</CButton>
                    <CButton onClick={() => navigate(-1)}>Back</CButton>
                    <CButton onClick={handleAdd}>Delete All</CButton>
                </div>


            </div>
        </div>
    )
}

export default CollectionDetail;