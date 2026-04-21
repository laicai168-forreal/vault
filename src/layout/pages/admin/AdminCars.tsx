import "./AdminCars.scss";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, createSearchParams, useNavigate, useSearchParams } from "react-router-dom";

import { CircularProgress, Pagination } from "@mui/material";

import { fetchCars } from "../../../api/carApi";
import CButton from "../../../components/common/CButton";
import CInput from "../../../components/common/CInput";
import { RootState } from "../../../store/store";
import { Car } from "../../../types/Car";

type CarsResponse = {
    items: Car[];
    pages: number;
    total: number;
};

const PAGE_LIMIT = 20;

const AdminCars = () => {
    const navigate = useNavigate();
    const { currentUser, loading: userLoading } = useSelector((state: RootState) => state.user);
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState<Car[]>([]);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [keywordInput, setKeywordInput] = useState(searchParams.get("keyword") || "");

    const page = Number(searchParams.get("page") || "1");
    const keyword = searchParams.get("keyword") || "";
    const isAdmin = currentUser?.role === "admin";

    useEffect(() => {
        setKeywordInput(keyword);
    }, [keyword]);

    useEffect(() => {
        if (!isAdmin) return;

        setLoading(true);
        setError(null);

        fetchCars({
            keyword,
            limit: PAGE_LIMIT,
            offset: (page - 1) * PAGE_LIMIT,
        })
            .then((response: CarsResponse) => {
                setItems(response.items || []);
                setPages(response.pages || 0);
                setTotal(response.total || 0);
            })
            .catch((loadError: Error) => {
                setError(loadError.message || "Failed to load cars.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [isAdmin, keyword, page]);

    const updateParams = (patch: Record<string, string | null>) => {
        const next = new URLSearchParams(searchParams);

        Object.entries(patch).forEach(([key, value]) => {
            if (value) {
                next.set(key, value);
            } else {
                next.delete(key);
            }
        });

        setSearchParams(next);
    };

    return (
        <div className="admin-cars-page">
            {!userLoading && !isAdmin && (
                <div className="admin-cars-alert error">Admin access is required for this page.</div>
            )}

            {isAdmin && (
                <>
            <div className="admin-cars-header">
                <div>
                    <h1>Admin Car Maintenance</h1>
                    <p>
                        Basic maintenance view powered by the current car list API. It is intentionally simple for now and gives us a clean bridge into the shared editor flow.
                    </p>
                </div>
                <div className="admin-cars-header-actions">
                    <CButton theme="outline-primary" onClick={() => navigate("/admin/users")}>
                        User Roles
                    </CButton>
                    <CButton theme="mono" onClick={() => navigate("/admin/car-requests")}>
                        Review Suggestions
                    </CButton>
                    <CButton onClick={() => navigate("/cars/edit?actor=admin&intent=create")}>
                        Add New Entry
                    </CButton>
                </div>
            </div>

            <div className="admin-cars-toolbar">
                <CInput
                    label="Search"
                    value={keywordInput}
                    placeholder="Search existing cars"
                    onChange={(value) => setKeywordInput(typeof value === "string" ? value : "")}
                />
                <div className="admin-cars-toolbar-actions">
                    <CButton onClick={() => updateParams({ keyword: keywordInput || null, page: "1" })}>
                        Search
                    </CButton>
                    <CButton theme="mono" onClick={() => updateParams({ keyword: null, page: "1" })}>
                        Clear
                    </CButton>
                </div>
            </div>

            <div className="admin-cars-meta">
                <span>{total} entries</span>
                <Link to="/cars" className="admin-cars-link">Back to customer cars page</Link>
            </div>

            {loading && (
                <div className="admin-cars-loading">
                    <CircularProgress size={22} />
                    <span>Loading cars...</span>
                </div>
            )}

            {error && <div className="admin-cars-alert error">{error}</div>}

            {!loading && !error && (
                <div className="admin-cars-table">
                    <div className="admin-cars-row admin-cars-row-header">
                        <span>Title</span>
                        <span>Brand</span>
                        <span>SKU</span>
                        <span>Actions</span>
                    </div>
                    {items.map((car) => (
                        <div key={car.id} className="admin-cars-row">
                            <span>{car.title || "Untitled car"}</span>
                            <span>{car.brand || "-"}</span>
                            <span>{car.original_id || car.originalId || "-"}</span>
                            <div className="admin-cars-actions">
                                <button
                                    onClick={() => navigate(`/cars/edit?${createSearchParams({ actor: "admin", intent: "edit", cid: car.id })}`)}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => navigate(`/cars/edit?${createSearchParams({ actor: "admin", intent: "duplicate", cid: car.id })}`)}
                                >
                                    Duplicate
                                </button>
                                <button
                                    onClick={() => navigate(`/car_detail?${createSearchParams({ cid: car.id })}`)}
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="admin-cars-empty">
                            No cars matched the current filters.
                        </div>
                    )}
                </div>
            )}

            {pages > 1 && (
                <Pagination
                    count={pages}
                    page={page}
                    onChange={(_, nextPage) => updateParams({ page: String(nextPage) })}
                    variant="outlined"
                    shape="rounded"
                />
            )}
                </>
            )}
        </div>
    );
};

export default AdminCars;
