import "./AdminCarRequestReview.scss";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { CircularProgress } from "@mui/material";

import {
    AdminCarFormOptions,
    CarChangeRequestDetail,
    fetchAdminCarChangeRequestDetail,
    fetchAdminCarFormOptions,
    reviewAdminCarChangeRequest,
} from "../../../api/carApi";
import CButton from "../../../components/common/CButton";
import CComboBox from "../../../components/common/CComboBox";
import CContainer from "../../../components/common/CContainer";
import CInput from "../../../components/common/CInput";
import { RootState } from "../../../store/store";
import { Car } from "../../../types/Car";

type BackendCarLike = Partial<Car> & {
    brand_name?: string;
    make_name?: string;
    product_line_name?: string;
};

type ReviewForm = {
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
    release_date_approximate: string;
    description_ai: string;
    is_chase: boolean;
    is_limited: boolean;
    limited_pieces: string;
};

const emptyForm: ReviewForm = {
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
    release_date_approximate: "",
    description_ai: "",
    is_chase: false,
    is_limited: false,
    limited_pieces: "",
};

const normalizeCarToForm = (car?: BackendCarLike | null): ReviewForm => ({
    code: String(car?.code || ""),
    brand: String(car?.brand || car?.brand_name || ""),
    brand_id: car?.brand_id || undefined,
    title: String(car?.title || ""),
    make: String(car?.make || car?.make_name || car?.make_ai || ""),
    make_id: car?.make_id || undefined,
    model_ai: String(car?.model_ai || ""),
    scale: String(car?.scale || ""),
    product_line: String(car?.product_line || car?.product_line_name || ""),
    product_line_id: car?.product_line_id || undefined,
    original_id: String(car?.original_id || car?.originalId || ""),
    release_date_approximate: String(car?.release_date_approximate || ""),
    description_ai: String(car?.description_ai || ""),
    is_chase: Boolean(car?.is_chase),
    is_limited: Boolean(car?.is_limited),
    limited_pieces: car?.limited_pieces ? String(car?.limited_pieces) : "",
});

const normalizePayloadToForm = (payload?: Record<string, any> | null): ReviewForm => ({
    ...emptyForm,
    ...(payload || {}),
    code: String(payload?.code || ""),
    brand: String(payload?.brand || ""),
    title: String(payload?.title || ""),
    make: String(payload?.make || ""),
    model_ai: String(payload?.model_ai || ""),
    scale: String(payload?.scale || ""),
    product_line: String(payload?.product_line || ""),
    original_id: String(payload?.original_id || ""),
    release_date_approximate: String(payload?.release_date_approximate || ""),
    description_ai: String(payload?.description_ai || ""),
    is_chase: Boolean(payload?.is_chase),
    is_limited: Boolean(payload?.is_limited),
    limited_pieces: payload?.limited_pieces ? String(payload?.limited_pieces) : "",
});

const CASE_INSENSITIVE_FIELDS: Array<keyof ReviewForm> = ["brand", "make", "product_line"];

const normalizeCompareValue = (field: keyof ReviewForm, value: unknown) => {
    const normalized = String(value ?? "").trim();
    if (CASE_INSENSITIVE_FIELDS.includes(field)) {
        return normalized.toLowerCase();
    }
    return normalized;
};

const alignCaseOnlySuggestionFields = (currentForm: ReviewForm, suggestedForm: ReviewForm): ReviewForm => {
    const next = { ...suggestedForm };

    CASE_INSENSITIVE_FIELDS.forEach((field) => {
        if (
            normalizeCompareValue(field, currentForm[field]) === normalizeCompareValue(field, suggestedForm[field])
            && String(currentForm[field] || "").trim() !== ""
        ) {
            next[field] = currentForm[field] as never;
        }
    });

    return next;
};

const AdminCarRequestReview = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser, loading: userLoading } = useSelector((state: RootState) => state.user);
    const [detail, setDetail] = useState<CarChangeRequestDetail | null>(null);
    const [form, setForm] = useState<ReviewForm>(emptyForm);
    const [reviewNotes, setReviewNotes] = useState("");
    const [formOptions, setFormOptions] = useState<AdminCarFormOptions>({ brands: [], makes: [], productLines: [] });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const requestId = searchParams.get("requestId") || "";
    const isAdmin = currentUser?.role === "admin";
    const isAdminDenied = !userLoading && !isAdmin;

    useEffect(() => {
        if (!isAdmin || !requestId) return;

        setLoading(true);
        setError(null);

        Promise.all([
            fetchAdminCarChangeRequestDetail(requestId),
            fetchAdminCarFormOptions(),
        ])
            .then(([loadedDetail, options]) => {
                setDetail(loadedDetail);
                setFormOptions(options);
                const currentForm = normalizeCarToForm(loadedDetail.currentCar);
                const suggestedForm = alignCaseOnlySuggestionFields(
                    currentForm,
                    normalizePayloadToForm(loadedDetail.request.payload),
                );
                setForm({ ...currentForm, ...suggestedForm });
                setReviewNotes(loadedDetail.request.review_notes || "");
            })
            .catch((loadError: Error) => {
                setError(loadError.message || "Failed to load request.");
            })
            .finally(() => setLoading(false));
    }, [isAdmin, requestId]);

    const currentValues = useMemo(() => normalizeCarToForm(detail?.currentCar), [detail]);
    const suggestedValues = useMemo(
        () => alignCaseOnlySuggestionFields(
            normalizeCarToForm(detail?.currentCar),
            normalizePayloadToForm(detail?.request.payload),
        ),
        [detail],
    );

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

    const updateField = (patch: Partial<ReviewForm>) => setForm((prev) => ({ ...prev, ...patch }));

    const handleTextChange = (field: keyof ReviewForm) => (value: Record<string, string> | string) => {
        const nextValue = typeof value === "string" ? value : String(value[field] || "");
        updateField({ [field]: nextValue } as Partial<ReviewForm>);
    };

    const handleLookupInputChange = (field: "brand" | "make" | "product_line", value: string) => {
        setForm((prev) => {
            const next: ReviewForm = { ...prev, [field]: value };
            if (field === "brand") {
                next.brand_id = undefined;
                next.product_line_id = undefined;
            }
            if (field === "make") next.make_id = undefined;
            if (field === "product_line") next.product_line_id = undefined;
            return next;
        });
    };

    const buildFinalPayload = () => ({
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
        release_date_approximate: form.release_date_approximate || undefined,
        description_ai: form.description_ai || undefined,
        is_chase: form.is_chase,
        is_limited: form.is_limited,
        limited_pieces: form.is_limited && form.limited_pieces ? Number(form.limited_pieces) : null,
    });

    const applyField = (field: keyof ReviewForm, source: "current" | "suggested") => {
        const sourceForm = source === "current" ? currentValues : suggestedValues;
        updateField({ [field]: sourceForm[field] } as Partial<ReviewForm>);
    };

    const handleReview = async (status: "approved" | "rejected") => {
        if (!detail) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await reviewAdminCarChangeRequest(detail.request.id, {
                status,
                reviewNotes,
                ...(status === "approved" ? { finalPayload: buildFinalPayload() } : {}),
            });
            navigate("/admin/car-requests");
            return;
        } catch (reviewError: any) {
            setError(reviewError?.response?.data?.detail || reviewError?.message || "Unable to review request.");
        } finally {
            setSaving(false);
        }
    };

    const fieldRows: Array<{ key: keyof ReviewForm; label: string; multiline?: boolean; type?: string }> = [
        { key: "title", label: "Title" },
        { key: "brand", label: "Brand" },
        { key: "make", label: "Make" },
        { key: "model_ai", label: "Model" },
        { key: "product_line", label: "Product line" },
        { key: "scale", label: "Scale" },
        { key: "release_date_approximate", label: "Release date", type: "date" },
        { key: "original_id", label: "Original id" },
        { key: "description_ai", label: "Description", multiline: true },
    ];

    const isFieldChanged = (field: keyof ReviewForm) => {
        const currentValue = normalizeCompareValue(field, currentValues[field]);
        const suggestedValue = normalizeCompareValue(field, suggestedValues[field]);
        return currentValue !== suggestedValue;
    };

    const areFlagsChanged =
        currentValues.is_chase !== suggestedValues.is_chase ||
        currentValues.is_limited !== suggestedValues.is_limited ||
        String(currentValues.limited_pieces || "").trim() !== String(suggestedValues.limited_pieces || "").trim();

    return (
        <CContainer className="admin-car-request-review-page">
            <div className="admin-car-request-review-header">
                <div>
                    <h1>Review Suggestion</h1>
                    <p>Compare the current record with the customer suggestion, then approve, reject, or refine the final data before applying it.</p>
                </div>
                <div className="admin-car-request-review-actions">
                    <Link to="/admin/car-requests" className="admin-car-request-review-link">Back to queue</Link>
                    <CButton theme="mono" onClick={() => navigate(-1)}>Back</CButton>
                </div>
            </div>

            {loading && (
                <div className="admin-car-request-review-loading">
                    <CircularProgress size={22} />
                    <span>Loading request...</span>
                </div>
            )}

            {error && <div className="admin-car-request-review-alert error">{error}</div>}
            {success && <div className="admin-car-request-review-alert info">{success}</div>}
            {isAdminDenied && <div className="admin-car-request-review-alert error">Admin access is required for this page.</div>}

            {!loading && detail && !isAdminDenied && (
                <>
                    <div className="admin-car-request-review-summary">
                        <div>
                            <strong>{detail.request.car_title || detail.request.payload?.title || "New car suggestion"}</strong>
                            <p>Submitted by {detail.request.submitted_by_username || "Unknown user"} on {new Date(detail.request.created_at).toLocaleString()}</p>
                        </div>
                        <div className={`status-pill ${detail.request.status}`}>{detail.request.status}</div>
                    </div>

                    <div className="admin-car-request-review-grid">
                        <section className="admin-car-request-review-section">
                            <h2>Compare Values</h2>
                            <div className="admin-car-request-compare-list">
                                {fieldRows.map((field) => (
                                    <div
                                        key={field.key}
                                        className={`admin-car-request-compare-card ${isFieldChanged(field.key) ? "changed" : ""}`}
                                    >
                                        <div className="admin-car-request-compare-header">
                                            <div className="admin-car-request-compare-title">
                                                <strong>{field.label}</strong>
                                                {isFieldChanged(field.key) && <span className="change-pill">Changed</span>}
                                            </div>
                                            <div className="admin-car-request-compare-actions">
                                                <button onClick={() => applyField(field.key, "current")}>Use Current</button>
                                                <button onClick={() => applyField(field.key, "suggested")}>Use Suggestion</button>
                                            </div>
                                        </div>
                                        <div className="admin-car-request-compare-columns">
                                            <div className={isFieldChanged(field.key) ? "muted-column" : ""}>
                                                <span className="label">Current</span>
                                                <p>{String(currentValues[field.key] || "-")}</p>
                                            </div>
                                            <div className={isFieldChanged(field.key) ? "highlight-column" : ""}>
                                                <span className="label">Suggested</span>
                                                <p>{String(suggestedValues[field.key] || "-")}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className={`admin-car-request-compare-card ${areFlagsChanged ? "changed" : ""}`}>
                                    <div className="admin-car-request-compare-header">
                                        <div className="admin-car-request-compare-title">
                                            <strong>Flags</strong>
                                            {areFlagsChanged && <span className="change-pill">Changed</span>}
                                        </div>
                                    </div>
                                    <div className="admin-car-request-compare-columns">
                                        <div className={areFlagsChanged ? "muted-column" : ""}>
                                            <span className="label">Current</span>
                                            <p>Chase: {currentValues.is_chase ? "Yes" : "No"} | Limited: {currentValues.is_limited ? "Yes" : "No"} | Pieces: {currentValues.limited_pieces || "-"}</p>
                                        </div>
                                        <div className={areFlagsChanged ? "highlight-column" : ""}>
                                            <span className="label">Suggested</span>
                                            <p>Chase: {suggestedValues.is_chase ? "Yes" : "No"} | Limited: {suggestedValues.is_limited ? "Yes" : "No"} | Pieces: {suggestedValues.limited_pieces || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="admin-car-request-compare-actions">
                                        <button onClick={() => updateField({
                                            is_chase: currentValues.is_chase,
                                            is_limited: currentValues.is_limited,
                                            limited_pieces: currentValues.limited_pieces,
                                        })}>Use Current</button>
                                        <button onClick={() => updateField({
                                            is_chase: suggestedValues.is_chase,
                                            is_limited: suggestedValues.is_limited,
                                            limited_pieces: suggestedValues.limited_pieces,
                                        })}>Use Suggestion</button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="admin-car-request-review-section">
                            <h2>Final Applied Values</h2>
                            {!!detail.request.uploaded_images?.length && (
                                <div className="admin-car-request-uploaded-images">
                                    <h3>Uploaded Images</h3>
                                    <div className="admin-car-request-uploaded-grid">
                                        {detail.request.uploaded_images.map((image: any, index: number) => (
                                            <div className="admin-car-request-uploaded-card" key={`${image.file_url || image.file_name}-${index}`}>
                                                <img
                                                    src={image.file_url || ""}
                                                    alt={image.file_name || `Uploaded suggestion ${index + 1}`}
                                                />
                                                <div className="admin-car-request-uploaded-copy">
                                                    <strong>{image.file_name || `Upload ${index + 1}`}</strong>
                                                    <span>{image.content_type || "image"}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="admin-car-request-uploaded-note">
                                        Approving this request will attach these uploaded images to the car record automatically.
                                    </p>
                                </div>
                            )}
                            <div className="admin-car-request-form-grid">
                                <CInput label="Code" value={form.code} onChange={handleTextChange("code")} placeholder="Internal code" />
                                <CInput label="Title" value={form.title} onChange={handleTextChange("title")} placeholder="Display title" />

                                <div className="form-row">
                                    <label className="form-label">Brand</label>
                                    <CComboBox
                                        value={form.brand}
                                        options={formOptions.brands}
                                        getLabel={(option) => option.name}
                                        getValue={(option) => option.id}
                                        placeholder="Select or type a brand"
                                        onChange={(value) => handleLookupInputChange("brand", value)}
                                        onSelect={(option) => setForm((prev) => ({ ...prev, brand: option.name, brand_id: option.id, product_line_id: undefined }))}
                                    />
                                </div>

                                <div className="form-row">
                                    <label className="form-label">Make</label>
                                    <CComboBox
                                        value={form.make}
                                        options={formOptions.makes}
                                        getLabel={(option) => option.name}
                                        getValue={(option) => option.id}
                                        placeholder="Select or type a make"
                                        onChange={(value) => handleLookupInputChange("make", value)}
                                        onSelect={(option) => setForm((prev) => ({ ...prev, make: option.name, make_id: option.id }))}
                                    />
                                </div>

                                <CInput label="Model" value={form.model_ai} onChange={handleTextChange("model_ai")} placeholder="Model name" />

                                <div className="form-row">
                                    <label className="form-label">Product line</label>
                                    <CComboBox
                                        value={form.product_line}
                                        options={filteredProductLineOptions}
                                        getLabel={(option) => option.name}
                                        getValue={(option) => option.id}
                                        placeholder="Select or type a product line"
                                        onChange={(value) => handleLookupInputChange("product_line", value)}
                                        onSelect={(option) => setForm((prev) => ({ ...prev, product_line: option.name, product_line_id: option.id }))}
                                    />
                                </div>

                                <CInput label="Scale" value={form.scale} onChange={handleTextChange("scale")} placeholder="1:64" />
                                <CInput label="Original id" value={form.original_id} onChange={handleTextChange("original_id")} placeholder="SKU / original id" />
                                <CInput label="Release date" type="date" value={form.release_date_approximate} onChange={handleTextChange("release_date_approximate")} />

                                <div className="admin-car-request-check-group">
                                    <label className="admin-car-request-check">
                                        <input type="checkbox" checked={form.is_chase} onChange={(e) => updateField({ is_chase: e.target.checked })} />
                                        <span>Chase</span>
                                    </label>
                                    <label className="admin-car-request-check">
                                        <input type="checkbox" checked={form.is_limited} onChange={(e) => updateField({ is_limited: e.target.checked })} />
                                        <span>Limited Edition</span>
                                    </label>
                                </div>

                                <CInput
                                    label="Limited pieces"
                                    value={form.limited_pieces}
                                    onChange={handleTextChange("limited_pieces")}
                                    placeholder="Optional piece count"
                                    disabled={!form.is_limited}
                                />

                                <CInput
                                    label="Description"
                                    value={form.description_ai}
                                    onChange={handleTextChange("description_ai")}
                                    placeholder="Notes to apply to the final car record"
                                    multiline
                                    rows={8}
                                />
                            </div>

                            <CInput
                                label="Review notes"
                                value={reviewNotes}
                                onChange={(value) => setReviewNotes(typeof value === "string" ? value : "")}
                                placeholder="Optional notes visible on the request"
                                multiline
                                rows={4}
                            />
                        </section>
                    </div>

                    <div className="admin-car-request-review-footer">
                        <div className="admin-car-request-review-footer-copy">
                            Approving will apply the final values above to the linked car, or create a new one for missing-car suggestions.
                        </div>
                        <div className="admin-car-request-review-footer-actions">
                            <CButton theme="warn" onClick={() => handleReview("rejected")} disabled={saving || detail.request.status !== "pending"} loading={saving}>
                                Reject
                            </CButton>
                            <CButton onClick={() => handleReview("approved")} disabled={saving || detail.request.status !== "pending"} loading={saving}>
                                Approve and Apply
                            </CButton>
                        </div>
                    </div>
                </>
            )}
        </CContainer>
    );
};

export default AdminCarRequestReview;
