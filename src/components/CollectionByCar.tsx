import dayjs from "dayjs";
import { ChangeEvent, useEffect, useState } from "react";
import defaultImage from '../assets/images/default_item_image.jpg';
import { BRAND_LOGO, BRAND_NAME } from "../constants/brand";
import { noop } from "../constants/common";
import { Car } from "../types/Car";
import { CollectionEntry, StorageLocation } from "../types/UserCollection";
import { getCarCfnUrlByS3Url } from "../utils/carsUtil";
import "./CollectionByCar.scss";
import CButton from "./common/CButton";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import CComboBox from "./common/CComboBox";

interface CollectionByCarProps {
    conditionTypes?: string[];
    storeLocations?: StorageLocation[];
    car?: Car;
    items?: CollectionEntry[];
    onSave?: (items: CollectionEntry[]) => void
    onDelete?: (itemId: string, carId: string) => void
}

interface CollectionEntryFormProps {
    conditionTypes?: string[];
    storeLocations?: StorageLocation[];
    item?: CollectionEntry;
    isChanged: boolean;
    changedFields: Set<string>;
    allowDeletion?: boolean;
    onChange?: (state: CollectionEntry) => void;
    onDelete?: (itemId: string) => {}
}

export const CollectionEntryForm = ({
    conditionTypes = [],
    storeLocations = [],
    item,
    changedFields,
    isChanged = false,
    allowDeletion,
    onChange,
    onDelete,
}: CollectionEntryFormProps) => {
    if (!item) return <div>No entry data was found</div>;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let parsedValue: string | number | boolean = value;

        if (type === "number") {
            parsedValue = value === "" ? "" : Number(value);
        }

        if (type === "checkbox") {
            parsedValue = (e.target as HTMLInputElement).checked;
        }

        // Here to resolve the nested structure of storageLocation
        if (name === 'storageLocationName') {
            onChange?.({
                ...item,
                storageLocation: {
                    name: e.target.value
                },
            })
        } else if (name === "storageLocationId") {
            onChange?.({
                ...item,
                storageLocation: {
                    id: e.target.value
                },
            })
        } else {
            onChange?.({
                ...item,
                [name]: parsedValue,
            })
        }
    }
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.name !== "count") return;

        const value = Number(e.target.value);

        if (!Number.isFinite(value) || value < 1) {
            onChange?.({
                ...item,
                count: 1,
            });
        }
    };

    return (
        <div className={`collection-by-car-form ${isChanged ? "changed" : ""}`}>
            {isChanged && <span className="dirty-badge">Modified</span>}
            <div className="collection-by-car-input-unit">
                <label htmlFor="condition">
                    Condition:
                    <select
                        name="condition"
                        id="condition"
                        value={item.condition}
                        onChange={handleChange}
                    >
                        {
                            conditionTypes.map(c => (
                                <option key={c}>{c}</option>
                            ))
                        }
                    </select>

                </label>
            </div>
            <div className="collection-by-car-input-unit">
                <label>Count:
                    <input
                        type="number"
                        name="count"
                        min={1}
                        value={item.count ?? ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                </label>
            </div>
            <div className="collection-by-car-input-unit">
                <label>Purchase Date:
                    <input
                        type="date"
                        name="purchasedAt"
                        value={item.purchasedAt ?? ''}
                        onChange={handleChange}
                    />
                </label>
            </div>
            <div className="collection-by-car-input-unit">
                <label>Purchase Price:
                    <input
                        type="number"
                        name="purchasePrice"
                        min={0}
                        value={item.purchasePrice ?? ''}
                        onChange={handleChange}
                    />
                </label>
            </div>
            <div className="collection-by-car-input-unit">
                <label>Storage Location:</label>

                <CComboBox<StorageLocation>
                    value={item.storageLocation?.name || ""}
                    options={storeLocations}
                    getLabel={(o) => o.name || ""}
                    getValue={(o) => o.id || o.name || ""}
                    placeholder="Select or type location"
                    onChange={(value) => {
                        onChange?.({
                            ...item,
                            storageLocation: {
                                ...item.storageLocation,
                                name: value,
                                id: undefined,
                            },
                        });
                    }}
                    onSelect={(option) => {
                        onChange?.({
                            ...item,
                            storageLocation: {
                                id: option.id,
                                name: option.name,
                            },
                        });
                    }}
                />
            </div>
            {/* <div>
                Photos:

            </div> */}
            <div className="collection-by-car-input-unit full">
                <label>
                    Note:
                    <textarea
                        className={changedFields.has("notes") ? "changed" : ""}
                        name="notes"
                        value={item.notes ?? ''}
                        onChange={handleChange}
                    />
                </label>
            </div>
            <div className="collection-by-car-input-unit full">
                <input type="checkbox" checked={item.isInMarket} disabled /> In Market (Coming Soon)
            </div>
            <div className="collection-by-car-input-unit">
                <input
                    type="checkbox"
                    name="isPublished"
                    checked={item.isPublished}
                    onChange={handleChange}
                /> In Public
            </div>
            <div className="collection-by-car-time-info">
                <span>Created At: {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}</span>
                <span>Updated At: {dayjs(item.updatedAt).format("YYYY-MM-DD HH:mm:ss")}</span>
            </div>
            {
                allowDeletion &&
                <div className="collection-by-car-delete">
                    <CButton
                        theme="warn"
                        onClick={() => item.itemId && onDelete && onDelete(item.itemId)}
                    >
                        Delete Entry
                    </CButton>
                </div>
            }
        </div>
    )
}

const CollectionByCar = ({
    conditionTypes = [],
    storeLocations = [],
    car,
    items = [],
    onSave = noop,
    onDelete = noop,
}: CollectionByCarProps) => {
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
        setLocalItems(items);
        setOriginalItems(items);
    }, [items]);

    useEffect(() => {
        setIndexInputValue(String(currentIndex + 1));
    }, [currentIndex]);

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
            await onSave(localItems);
            setOriginalItems(localItems);
            setChangedMap(new Set());
            setChangedFieldsMap(new Map<string, Set<string>>())
        } catch (e) {
            // TODO: error handling
        }
    };

    const handleAdd = async () => {
        if (car) {
            try {
                const newItem = { carId: car.id };
                await onSave([{ carId: car.id }]);
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
        if (car) {
            try {
                await onDelete(itemId, car.id);
                setLocalItems(prev => prev.filter(i => i.itemId !== itemId));
                setOriginalItems(prev => prev.filter(i => i.itemId !== itemId));
            } catch (e) {
                // TODO: error handling
            }
        } else {
            // TODO: No car info is available
        }

    }

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
            <div className="collection-by-car-header">
                <div className="collection-by-car-title">
                    <div className="collection-by-car-image-wrapper">
                        <img className="collection-by-car-image" src={BRAND_LOGO[car?.brand ?? '']} />
                    </div>
                    <hr />
                    <div className="collection-by-car-image-wrapper">
                        <img
                            className="collection-by-car-image"
                            src={getCarCfnUrlByS3Url(car?.images?.[0]?.s3_url, 200) ?? defaultImage}
                        />
                    </div>
                    <div className="collection-by-car-title-text">
                        <h3 className="collection-by-car-title-text-top">
                            [{BRAND_NAME[car?.brand ?? ''] ?? "Unkown"}] {car?.title}
                        </h3>
                        <div>
                            Product Id: {car?.originalId || ''}
                        </div>
                    </div>
                </div>
            </div>
            <div className="collection-by-car-content">
                {/* {
                    localItems &&
                    (
                        <div>
                            {
                                localItems?.map(i => {
                                    const isChanged = changedMap.has(i.itemId);
                                    const changedFields = i.itemId ? changedFieldsMap.get(i.itemId) ?? new Set<string>() : new Set<string>();

                                    return (
                                        <CollectionEntryForm
                                            key={i.itemId}
                                            conditionTypes={conditionTypes}
                                            storeLocations={storeLocations}
                                            item={i}
                                            isChanged={isChanged}
                                            changedFields={changedFields}
                                            onChange={handleEntryChange}
                                        />
                                    )
                                })
                            }
                        </div>
                    )
                } */}
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
                <CButton onClick={handleAdd}> Add Entry</CButton>
                <CButton onClick={handleSave} disabled={changedMap.size === 0}>Save</CButton>
                <CButton>Cancel</CButton>
                {
                    localItems.length > 1 &&
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
                }
                <CButton onClick={handleAdd}>Delete All</CButton>

            </div>
        </div>
    )
}

export default CollectionByCar;