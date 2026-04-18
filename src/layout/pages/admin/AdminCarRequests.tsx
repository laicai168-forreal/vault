import "./AdminCarRequests.scss";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, createSearchParams, useNavigate, useSearchParams } from "react-router-dom";

import { CircularProgress } from "@mui/material";

import { CarChangeRequestItem, fetchAdminCarChangeRequests } from "../../../api/carApi";
import CButton from "../../../components/common/CButton";
import { RootState } from "../../../store/store";

const PAGE_LIMIT = 20;

const AdminCarRequests = () => {
    const navigate = useNavigate();
    const { currentUser, loading: userLoading } = useSelector((state: RootState) => state.user);
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState<CarChangeRequestItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const status = searchParams.get("status") || "";
    const page = Number(searchParams.get("page") || "1");
    const isAdmin = currentUser?.role === "admin";

    useEffect(() => {
        if (!isAdmin) return;

        setLoading(true);
        setError(null);

        fetchAdminCarChangeRequests({
            status: status || undefined,
            limit: PAGE_LIMIT,
            offset: (page - 1) * PAGE_LIMIT,
        })
            .then((response) => setItems(response || []))
            .catch((loadError: Error) => {
                setError(loadError.message || "Failed to load admin requests.");
            })
            .finally(() => setLoading(false));
    }, [isAdmin, page, status]);

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
        <div className="admin-car-requests-page">
            {!userLoading && !isAdmin && (
                <div className="admin-car-requests-alert error">Admin access is required for this page.</div>
            )}

            {isAdmin && (
                <>
                    <div className="admin-car-requests-header">
                        <div>
                            <h1>Suggestion Review Queue</h1>
                            <p>Review customer suggestions, compare them with current car data, and decide what should be applied.</p>
                        </div>
                        <CButton theme="mono" onClick={() => navigate("/admin/cars")}>
                            Back to Cars
                        </CButton>
                    </div>

                    <div className="admin-car-requests-toolbar">
                        <div className="admin-car-requests-filters">
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
                        <Link to="/cars" className="admin-car-requests-link">Back to customer cars page</Link>
                    </div>

                    {loading && (
                        <div className="admin-car-requests-loading">
                            <CircularProgress size={22} />
                            <span>Loading review queue...</span>
                        </div>
                    )}

                    {error && <div className="admin-car-requests-alert error">{error}</div>}

                    {!loading && !error && (
                        <div className="admin-car-requests-table">
                            <div className="admin-car-requests-row admin-car-requests-row-header">
                                <span>Submitted</span>
                                <span>Type</span>
                                <span>Car</span>
                                <span>Status</span>
                                <span>Actions</span>
                            </div>
                            {items.map((item) => (
                                <div key={item.id} className="admin-car-requests-row">
                                    <span>{item.submitted_by_username || "Unknown user"}</span>
                                    <span>{item.request_type}</span>
                                    <span>{item.car_title || item.payload?.title || "New car suggestion"}</span>
                                    <span className={`status-pill ${item.status}`}>{item.status}</span>
                                    <div className="admin-car-requests-actions">
                                        <button
                                            onClick={() => navigate(`/admin/car-requests/review?${createSearchParams({ requestId: item.id })}`)}
                                        >
                                            {item.status === "pending" ? "Review" : "View"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className="admin-car-requests-empty">
                                    No requests matched the current filter.
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminCarRequests;
