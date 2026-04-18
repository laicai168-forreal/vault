import "./CarChangeRequests.scss";

import { useEffect, useState } from "react";
import { Link, createSearchParams, useNavigate, useSearchParams } from "react-router-dom";

import { CircularProgress, Pagination } from "@mui/material";

import { CarChangeRequestItem, fetchMyCarChangeRequests } from "../../../api/carApi";
import CButton from "../../../components/common/CButton";

const PAGE_LIMIT = 20;

const CarChangeRequests = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState<CarChangeRequestItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const page = Number(searchParams.get("page") || "1");
    const status = searchParams.get("status") || "";

    useEffect(() => {
        setLoading(true);
        setError(null);

        fetchMyCarChangeRequests({
            status: status || undefined,
            limit: PAGE_LIMIT,
            offset: (page - 1) * PAGE_LIMIT,
        })
            .then((response) => setItems(response || []))
            .catch((loadError: Error) => {
                setError(loadError.message || "Failed to load your requests.");
            })
            .finally(() => setLoading(false));
    }, [page, status]);

    const updateParam = (key: string, value: string | null) => {
        const next = new URLSearchParams(searchParams);
        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }
        if (key !== "page") {
            next.set("page", "1");
        }
        setSearchParams(next);
    };

    return (
        <div className="car-change-requests-page">
            <div className="car-change-requests-header">
                <div>
                    <h1>My Car Suggestions</h1>
                    <p>Review the status of your submitted suggestions and update any request that is still pending.</p>
                </div>
                <CButton onClick={() => navigate("/cars/edit?actor=customer&intent=create")}>
                    New Suggestion
                </CButton>
            </div>

            <div className="car-change-requests-toolbar">
                <div className="car-change-requests-filters">
                    {["", "pending", "approved", "rejected"].map((option) => (
                        <button
                            key={option || "all"}
                            className={status === option ? "active" : ""}
                            onClick={() => updateParam("status", option || null)}
                        >
                            {option || "All"}
                        </button>
                    ))}
                </div>
                <Link to="/cars" className="car-change-requests-link">Back to cars</Link>
            </div>

            {loading && (
                <div className="car-change-requests-loading">
                    <CircularProgress size={22} />
                    <span>Loading your requests...</span>
                </div>
            )}

            {error && <div className="car-change-requests-alert error">{error}</div>}

            {!loading && !error && (
                <div className="car-change-requests-table">
                    <div className="car-change-requests-row car-change-requests-row-header">
                        <span>Type</span>
                        <span>Car</span>
                        <span>Status</span>
                        <span>Created</span>
                        <span>Actions</span>
                    </div>
                    {items.map((item) => (
                        <div key={item.id} className="car-change-requests-row">
                            <span>{item.request_type}</span>
                            <span>{item.car_title || item.payload?.title || "New car suggestion"}</span>
                            <span className={`status-pill ${item.status}`}>{item.status}</span>
                            <span>{new Date(item.created_at).toLocaleString()}</span>
                            <div className="car-change-requests-actions">
                                <button
                                    onClick={() => navigate(`/cars/edit?${createSearchParams({
                                        actor: "customer",
                                        intent: item.request_type === "create" ? "create" : "suggest",
                                        requestId: item.id,
                                        ...(item.car_id ? { cid: item.car_id } : {}),
                                    })}`)}
                                >
                                    {item.status === "pending" ? "Review / Edit" : "View"}
                                </button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="car-change-requests-empty">
                            No requests matched the current filter.
                        </div>
                    )}
                </div>
            )}

            {items.length === PAGE_LIMIT && (
                <Pagination
                    count={page + 1}
                    page={page}
                    onChange={(_, nextPage) => updateParam("page", String(nextPage))}
                    variant="outlined"
                    shape="rounded"
                />
            )}
        </div>
    );
};

export default CarChangeRequests;
