import "./CarEditor.scss";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { CircularProgress } from "@mui/material";

import { AdminCarFormOptions, createAdminCar, deleteAdminCar, duplicateAdminCar, fetchAdminCarFormOptions, fetchCarById, fetchCarChangeRequestSummary, submitCarChangeRequest, updateAdminCar } from "../../api/carApi";
import defaultImage from "../../assets/images/default_item_image.jpg";
import CComboBox from "../../components/common/CComboBox";
import CButton from "../../components/common/CButton";
import CContainer from "../../components/common/CContainer";
import CInput from "../../components/common/CInput";
import { RootState } from "../../store/store";
import { ImageObj } from "../../types/Images";
import { Car } from "../../types/Car";
import { getCarCfnUrlByS3Url } from "../../utils/carsUtil";

type EditorActor = "admin" | "customer";
type EditorIntent = "create" | "edit" | "duplicate" | "suggest";

type CarEditorForm = {
    code: string;
    brand: string;
    brand_id?: string;
    title: string;
    make: string;
    make_id?: string;
    model_ai: string;
    scale: string;
    product_line: string;
    product_line_id?: string;
    original_id: string;
    source_url: string;
    release_date_approximate: string;
    description_ai: string;
    is_chase: boolean;
    is_limited: boolean;
    limited_pieces: string;
};

const emptyForm: CarEditorForm = {
    code: "",
    brand: "",
    brand_id: undefined,
    title: "",
    make: "",
    make_id: undefined,
    model_ai: "",
    scale: "",
    product_line: "",
    product_line_id: undefined,
    original_id: "",
    source_url: "",
    release_date_approximate: "",
    description_ai: "",
    is_chase: false,
    is_limited: false,
    limited_pieces: "",
};

function normalizeCarToForm(car?: Partial<Car> | null): CarEditorForm {
    if (!car) return emptyForm;

    return {
        code: "",
        brand: car.brand || "",
        brand_id: car.brand_id,
        title: car.title || "",
        make: car.make || car.make_ai || "",
        make_id: car.make_id,
        model_ai: car.model_ai || "",
        scale: car.scale || "",
        product_line: car.product_line || "",
        product_line_id: car.product_line_id,
        original_id: car.original_id || car.originalId || "",
        source_url: car.product_url || "",
        release_date_approximate: car.release_date_approximate || "",
        description_ai: car.description_ai || "",
        is_chase: false,
        is_limited: false,
        limited_pieces: "",
    };
}

const CarEditor = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser, loading: userLoading } = useSelector((state: RootState) => state.user);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [remainingCount, setRemainingCount] = useState<number | null>(null);
    const [formOptions, setFormOptions] = useState<AdminCarFormOptions>({ brands: [], makes: [], productLines: [] });
    const [optionsLoading, setOptionsLoading] = useState(false);
    const [form, setForm] = useState<CarEditorForm>(emptyForm);
    const [sourceCar, setSourceCar] = useState<Car | null>(null);
    const [existingImages, setExistingImages] = useState<ImageObj[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const isAdmin = currentUser?.role === "admin";

    const requestedActor = (searchParams.get("actor") === "admin" ? "admin" : "customer") as EditorActor;
    const actor = (requestedActor === "admin" && isAdmin ? "admin" : "customer") as EditorActor;
    const intentParam = searchParams.get("intent");
    const intent = (
        intentParam === "create" ||
            intentParam === "edit" ||
            intentParam === "duplicate" ||
            intentParam === "suggest"
            ? intentParam
            : actor === "admin"
                ? "edit"
                : "suggest"
    ) as EditorIntent;
    const cid = searchParams.get("cid") || "";
    const isAdminDenied = requestedActor === "admin" && !userLoading && !isAdmin;

    useEffect(() => {
        let isMounted = true;

        if (!cid) {
            setSourceCar(null);
            setForm(emptyForm);
            setExistingImages([]);
            setLoadError(null);
            return;
        }

        setLoading(true);
        setLoadError(null);

        fetchCarById(cid)
            .then((car) => {
                if (!isMounted) return;
                setSourceCar(car);
                setExistingImages(car.images || []);
                setForm(
                    intent === "duplicate"
                        ? { ...normalizeCarToForm(car), code: "", original_id: "" }
                        : normalizeCarToForm(car)
                );
            })
            .catch((error: Error) => {
                if (!isMounted) return;
                setLoadError(error.message || "Failed to load car details.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [cid, intent]);

    useEffect(() => {
        let isMounted = true;

        if (actor !== "customer") {
            setRemainingCount(null);
            return;
        }

        setSummaryLoading(true);

        fetchCarChangeRequestSummary()
            .then((summary) => {
                if (!isMounted) return;
                setRemainingCount(summary.remainingCount);
            })
            .catch(() => {
                if (!isMounted) return;
                setRemainingCount(null);
            })
            .finally(() => {
                if (isMounted) setSummaryLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [actor]);

    useEffect(() => {
        let isMounted = true;

        if (actor !== "admin") return;

        setOptionsLoading(true);
        fetchAdminCarFormOptions()
            .then((options) => {
                if (!isMounted) return;
                setFormOptions(options);
            })
            .finally(() => {
                if (isMounted) setOptionsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [actor]);

    const pageTitle = useMemo(() => {
        if (actor === "admin") {
            if (intent === "create") return "Create car entry";
            if (intent === "duplicate") return "Duplicate car entry";
            return "Edit car entry";
        }

        if (intent === "create") return "Suggest a missing car";
        return "Suggest a correction";
    }, [actor, intent]);

    const helperText = actor === "admin"
        ? "Admin submissions save directly to the car record. Duplicate and delete actions are available here for data maintenance."
        : "Customer submissions create a pending review item for admin approval. Image upload storage can be added next once we decide where the files should land.";

    const primaryButtonLabel = actor === "admin"
        ? (intent === "create" || intent === "duplicate" ? "Create Entry" : "Save Changes")
        : "Submit Suggestion";

    const updateField = (patch: Partial<CarEditorForm>) => {
        setForm((prev) => ({ ...prev, ...patch }));
    };

    const handleTextChange = (field: keyof CarEditorForm) => (value: Record<string, string> | string) => {
        const nextValue = typeof value === "string" ? value : String(value[field] || "");
        updateField({ [field]: nextValue } as Partial<CarEditorForm>);
    };

    const handleCheckboxChange = (field: keyof CarEditorForm) => (event: ChangeEvent<HTMLInputElement>) => {
        updateField({ [field]: event.target.checked } as Partial<CarEditorForm>);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(Array.from(event.target.files || []));
    };

    const handlePromoteImage = (index: number) => {
        setExistingImages((prev) => {
            const next = [...prev];
            const [selected] = next.splice(index, 1);
            if (!selected) return prev;
            return [selected, ...next];
        });
    };

    const handleLookupInputChange = (field: "brand" | "make" | "product_line", value: string) => {
        setForm((prev) => {
            const next: CarEditorForm = { ...prev, [field]: value };

            if (field === "brand") {
                next.brand_id = undefined;
                next.product_line_id = undefined;
            }

            if (field === "make") {
                next.make_id = undefined;
            }

            if (field === "product_line") {
                next.product_line_id = undefined;
            }

            return next;
        });
    };

    const resolvedBrandId = useMemo(() => {
        if (form.brand_id) return form.brand_id;

        const normalizedBrand = form.brand.trim().toLowerCase();
        if (!normalizedBrand) return undefined;

        return formOptions.brands.find((option) => option.name.trim().toLowerCase() === normalizedBrand)?.id;
    }, [form.brand, form.brand_id, formOptions.brands]);

    const filteredProductLineOptions = useMemo(() => {
        if (!resolvedBrandId) return [];
        return formOptions.productLines.filter((option) => option.brand_id === resolvedBrandId);
    }, [formOptions.productLines, resolvedBrandId]);

    const buildAdminPayload = () => ({
        code: form.code || undefined,
        brand_id: form.brand_id || undefined,
        brand: form.brand || undefined,
        title: form.title || undefined,
        make_id: form.make_id || undefined,
        make: form.make || undefined,
        model_ai: form.model_ai || undefined,
        scale: form.scale || undefined,
        product_line_id: form.product_line_id || undefined,
        product_line: form.product_line || undefined,
        original_id: form.original_id || undefined,
        source_url: form.source_url || undefined,
        release_date_approximate: form.release_date_approximate || undefined,
        description_ai: form.description_ai || undefined,
        is_chase: form.is_chase,
        is_limited: form.is_limited,
        limited_pieces: form.is_limited && form.limited_pieces ? Number(form.limited_pieces) : null,
        images: existingImages.length > 0 ? existingImages : undefined,
    });

    const buildCustomerPayload = () => ({
        car_id: cid || undefined,
        request_type: intent === "create" ? "create" : "correction",
        payload: {
            ...buildAdminPayload(),
            existing_images: existingImages,
            primary_image: existingImages[0] || null,
            selected_image_names: selectedFiles.map((file) => file.name),
        },
        uploaded_images: selectedFiles.map((file) => ({
            file_name: file.name,
            content_type: file.type,
            size: file.size,
        })),
    });

    const handleSubmit = async () => {
        setSaving(true);
        setSubmitError(null);
        setSubmitSuccess(null);

        try {
            if (actor === "admin") {
                const payload = buildAdminPayload();
                let response;

                if (intent === "create") {
                    response = await createAdminCar(payload);
                    setSubmitSuccess("Car entry created.");
                } else if (intent === "duplicate" && cid) {
                    response = await duplicateAdminCar(cid, payload);
                    setSubmitSuccess("Car entry duplicated.");
                } else if (cid) {
                    response = await updateAdminCar(cid, payload);
                    setSubmitSuccess("Car entry updated.");
                }

                if (response?.id) {
                    navigate(`/cars/edit?actor=admin&intent=edit&cid=${response.id}`);
                }
            } else {
                await submitCarChangeRequest(buildCustomerPayload());
                setSubmitSuccess("Suggestion submitted for admin review.");
                setRemainingCount((current) => current === null ? current : Math.max(current - 1, 0));
                if (cid) {
                    navigate(`/car_detail?cid=${cid}`);
                } else {
                    setForm(emptyForm);
                    setSelectedFiles([]);
                }
            }
        } catch (error: any) {
            setSubmitError(error?.response?.data?.detail || error?.message || "Unable to submit.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!cid || !window.confirm("Delete this car entry? This cannot be undone.")) return;

        setSaving(true);
        setSubmitError(null);
        setSubmitSuccess(null);

        try {
            await deleteAdminCar(cid);
            navigate("/admin/cars");
        } catch (error: any) {
            setSubmitError(error?.response?.data?.detail || error?.message || "Unable to delete.");
        } finally {
            setSaving(false);
        }
    };

    const handleDuplicate = async () => {
        if (!cid) return;

        setSaving(true);
        setSubmitError(null);
        setSubmitSuccess(null);

        try {
            const response = await duplicateAdminCar(cid, buildAdminPayload());
            setSubmitSuccess("Car entry duplicated.");

            if (response?.id) {
                navigate(`/cars/edit?actor=admin&intent=edit&cid=${response.id}`);
            }
        } catch (error: any) {
            setSubmitError(error?.response?.data?.detail || error?.message || "Unable to duplicate.");
        } finally {
            setSaving(false);
        }
    };

    const isSubmitDisabled =
        saving ||
        loading ||
        (actor === "admin" && intent === "create" && (!form.code || !form.brand)) ||
        (actor === "customer" && remainingCount !== null && remainingCount <= 0);

    return (
        <CContainer className="car-editor-page">
            <div className="car-editor-header">
                <div>
                    <div className={`car-editor-badge ${actor}`}>{actor === "admin" ? "Admin" : "Customer"}</div>
                    <h1>{pageTitle}</h1>
                    <p>{helperText}</p>
                </div>
                <div className="car-editor-header-actions">
                    {isAdmin && (
                        <Link to="/admin/cars" className="car-editor-link-button">
                            Back to admin list
                        </Link>
                    )}
                    <CButton theme="mono" onClick={() => navigate(-1)}>
                        Back
                    </CButton>
                </div>
            </div>

            {loading && (
                <div className="car-editor-loading">
                    <CircularProgress size={22} />
                    <span>Loading car details...</span>
                </div>
            )}

            {loadError && <div className="car-editor-alert error">{loadError}</div>}
            {submitError && <div className="car-editor-alert error">{submitError}</div>}
            {submitSuccess && <div className="car-editor-alert info">{submitSuccess}</div>}

            {isAdminDenied && (
                <div className="car-editor-alert error">
                    Admin access is required for this view.
                </div>
            )}

            {!loading && !isAdminDenied && (
                <>
                    {sourceCar && (
                        <div className="car-editor-source-card">
                            <div>
                                <strong>Loaded from existing entry</strong>
                                <p>{sourceCar.title || "Untitled car"}</p>
                            </div>
                            <div className="car-editor-source-meta">
                                <span>{sourceCar.brand || "Unknown brand"}</span>
                                <span>{sourceCar.original_id || sourceCar.originalId || "No original id"}</span>
                            </div>
                        </div>
                    )}

                    {actor === "customer" && (
                        <div className="car-editor-limit-note">
                            {summaryLoading && "Checking your weekly submission limit..."}
                            {!summaryLoading && remainingCount !== null && `You have ${remainingCount} submission chance${remainingCount === 1 ? "" : "s"} remaining this week.`}
                            {!summaryLoading && remainingCount === null && "Weekly submission limits are enforced by the backend. We could not load your remaining count right now."}
                        </div>
                    )}

                    <div className="car-editor-grid">
                        <section className="car-editor-section">
                            <h2>Core Details</h2>
                            {existingImages.length > 0 && (
                                <div className="car-editor-image-manager">
                                    <div className="car-editor-primary-image">
                                        <div className="car-editor-primary-label">Primary image</div>
                                        <img
                                            src={getCarCfnUrlByS3Url(existingImages[0]?.s3_url, 900) || defaultImage}
                                            alt={form.title || "Primary car image"}
                                        />
                                        <p>
                                            The first image is treated as the primary image everywhere in the app.
                                        </p>
                                    </div>

                                    <div className="car-editor-image-list">
                                        {existingImages.map((image, index) => (
                                            <div
                                                key={`${image.s3_url || image.original_url || "image"}-${index}`}
                                                className={`car-editor-image-card ${index === 0 ? "primary" : ""}`}
                                            >
                                                <img
                                                    src={getCarCfnUrlByS3Url(image.s3_url, 260) || image.original_url || defaultImage}
                                                    alt={`${form.title || "Car"} view ${index + 1}`}
                                                />
                                                <div className="car-editor-image-card-copy">
                                                    <strong>{index === 0 ? "Primary" : `Image ${index + 1}`}</strong>
                                                    <span>{image.original_url || image.s3_url || "No image source"}</span>
                                                </div>
                                                <CButton
                                                    theme="mono"
                                                    onClick={() => handlePromoteImage(index)}
                                                    disabled={index === 0}
                                                >
                                                    {index === 0 ? "Primary" : "Make Primary"}
                                                </CButton>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="car-editor-form-grid">
                                {actor === "admin" && (
                                    <CInput label="Code" value={form.code} onChange={handleTextChange("code")} placeholder="Internal code" />
                                )}
                                <CInput label="Title" value={form.title} onChange={handleTextChange("title")} placeholder="Display title" />
                                {actor === "admin" ? (
                                    <div className="form-row">
                                        <label className="form-label">Brand</label>
                                        <CComboBox
                                            value={form.brand}
                                            options={formOptions.brands}
                                            getLabel={(option) => option.name}
                                            getValue={(option) => option.id}
                                            placeholder={optionsLoading ? "Loading brands..." : "Select or type a brand"}
                                            onChange={(value) => handleLookupInputChange("brand", value)}
                                            onSelect={(option) => setForm((prev) => ({
                                                ...prev,
                                                brand: option.name,
                                                brand_id: option.id,
                                                product_line_id: undefined,
                                            }))}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <CInput label="Brand" value={form.brand} onChange={handleTextChange("brand")} placeholder="Brand name" />
                                        <p className="car-editor-field-hint">
                                            The brand is the diecast brand or line, such as `Hot Wheels`, `Mini GT`, or `Tarmac Works`.
                                        </p>
                                    </div>
                                )}
                                {actor === "admin" ? (
                                    <div className="form-row">
                                        <label className="form-label">Make</label>
                                        <CComboBox
                                            value={form.make}
                                            options={formOptions.makes}
                                            getLabel={(option) => option.name}
                                            getValue={(option) => option.id}
                                            placeholder={optionsLoading ? "Loading makes..." : "Select or type a make"}
                                            onChange={(value) => handleLookupInputChange("make", value)}
                                            onSelect={(option) => setForm((prev) => ({
                                                ...prev,
                                                make: option.name,
                                                make_id: option.id,
                                            }))}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <CInput label="Make" value={form.make} onChange={handleTextChange("make")} placeholder="Car make" />
                                        <p className="car-editor-field-hint">
                                            The make is the real vehicle manufacturer, such as `Toyota`, `Porsche`, or `Mercedes-Benz`.
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <CInput label="Model" value={form.model_ai} onChange={handleTextChange("model_ai")} placeholder="Model name" />
                                    {actor === "customer" && (
                                        <p className="car-editor-field-hint">
                                            Use the specific car name here, like `911 GT3 RS`, `Civic Type R`, or `Skyline GT-R R34`.
                                        </p>
                                    )}
                                </div>
                                {actor === "admin" ? (
                                    <div className="form-row">
                                        <label className="form-label">Product line</label>
                                        <CComboBox
                                            value={form.product_line}
                                            options={filteredProductLineOptions}
                                            getLabel={(option) => option.name}
                                            getValue={(option) => option.id}
                                            placeholder={optionsLoading ? "Loading product lines..." : "Select or type a product line"}
                                            onChange={(value) => handleLookupInputChange("product_line", value)}
                                            onSelect={(option) => setForm((prev) => ({
                                                ...prev,
                                                product_line: option.name,
                                                product_line_id: option.id,
                                            }))}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <CInput label="Product line" value={form.product_line} onChange={handleTextChange("product_line")} placeholder="Product line" />
                                        <p className="car-editor-field-hint">
                                            Product line means the sub-series under the brand, like `Boulevard`, `Premium`, `Kaido House`, or `Pop Race x Enigma`.
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <CInput label="Scale" value={form.scale} onChange={handleTextChange("scale")} placeholder="1:64" />
                                    {actor === "customer" && (
                                        <p className="car-editor-field-hint">
                                            Use the ratio format, usually something like `1:64`, `1:43`, or `1:18`.
                                        </p>
                                    )}
                                </div>
                                {actor === "admin" && (
                                    <CInput label="Original id" value={form.original_id} onChange={handleTextChange("original_id")} placeholder="SKU / original id" />
                                )}
                                <div>
                                    <CInput label="Release date" type="date" value={form.release_date_approximate} onChange={handleTextChange("release_date_approximate")} placeholder="YYYY-MM-DD" />
                                    {actor === "customer" && (
                                        <p className="car-editor-field-hint">
                                            Use your best estimate if you do not know the exact day. Admin can refine it later.
                                        </p>
                                    )}
                                </div>
                                {actor === "admin" && (
                                    <CInput label="Source URL" value={form.source_url} onChange={handleTextChange("source_url")} placeholder="Source page URL" />
                                )}
                                <div className="car-editor-check-group">
                                    <label className="car-editor-check">
                                        <input type="checkbox" checked={form.is_chase} onChange={handleCheckboxChange("is_chase")} />
                                        <span>Chase</span>
                                    </label>
                                    <label className="car-editor-check">
                                        <input type="checkbox" checked={form.is_limited} onChange={handleCheckboxChange("is_limited")} />
                                        <span>Limited Edition</span>
                                    </label>
                                </div>
                                <div>
                                    <CInput
                                        label="Limited pieces"
                                        value={form.limited_pieces}
                                        onChange={handleTextChange("limited_pieces")}
                                        placeholder="Optional piece count"
                                        disabled={!form.is_limited}
                                    />
                                    {actor === "customer" && (
                                        <p className="car-editor-field-hint">
                                            Check limited edition if this car is a limited release, and fill in the piece count if you know it. This helps collectors understand the rarity of the car.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="car-editor-section">
                            <h2>{actor === "admin" ? "Review Notes" : "Your Suggestion"}</h2>
                            <CInput
                                label="Description"
                                value={form.description_ai}
                                onChange={handleTextChange("description_ai")}
                                placeholder={actor === "admin" ? "Internal notes or improved description" : "Tell us what should be corrected or added"}
                                multiline
                                rows={8}
                            />

                            <div className="car-editor-upload">
                                <label className="form-label">
                                    {actor === "admin" ? "Reference images" : "Upload car images"}
                                </label>
                                <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                                <p>
                                    {selectedFiles.length > 0
                                        ? `${selectedFiles.length} file(s) selected`
                                        : actor === "admin"
                                            ? "Reference image upload is still local-only for now."
                                            : "Customer uploads are currently submitted as file metadata until we add storage + signed upload support."}
                                </p>
                            </div>
                        </section>
                    </div>

                    <div className="car-editor-footer">
                        <div className="car-editor-footer-copy">
                            {actor === "admin"
                                ? "Admin updates now write directly to the backend."
                                : "Customer submissions now create pending change requests for review."}
                        </div>
                        <div className="car-editor-footer-actions">
                            {actor === "admin" && cid && intent !== "duplicate" && (
                                <CButton theme="warn" onClick={handleDelete} disabled={saving}>
                                    Delete
                                </CButton>
                            )}
                            {actor === "admin" && cid && intent !== "duplicate" && (
                                <CButton
                                    theme="mono"
                                    onClick={handleDuplicate}
                                    disabled={saving}
                                >
                                    Duplicate
                                </CButton>
                            )}
                            <CButton onClick={handleSubmit} disabled={isSubmitDisabled} loading={saving}>
                                {primaryButtonLabel}
                            </CButton>
                        </div>
                    </div>
                </>
            )}
        </CContainer>
    );
};

export default CarEditor;
