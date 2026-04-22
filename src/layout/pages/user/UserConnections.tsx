import "./UserConnections.scss";

import { Pagination } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import defaultAvatar from "../../../assets/images/default-avatar.jpg";
import {
    getPublicFollowers,
    getPublicFollowing,
    getPublicUserProfile,
    removeFollower,
    unfollowUser,
} from "../../../api/userApi";
import CButton from "../../../components/common/CButton";
import CContainer from "../../../components/common/CContainer";
import CImage from "../../../components/common/CImage";
import CSkeleton from "../../../components/common/CSkeleton";
import { RootState } from "../../../store/store";
import { PublicUserConnectionItem, PublicUserConnectionListResponse, PublicUserProfileResponse } from "../../../types/User";
import { useAuthAction } from "../../../hooks/useAuthAction";

const PAGE_SIZE = 20;

const UserConnections = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentUser } = useSelector((state: RootState) => state.user);
    const [profile, setProfile] = useState<PublicUserProfileResponse | null>(null);
    const [listData, setListData] = useState<PublicUserConnectionListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const tab = searchParams.get("tab") === "following" ? "following" : "followers";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const isOwnProfile = !!userId && !!currentUser?.id && currentUser.id === userId;

    const loadData = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const [nextProfile, nextList] = await Promise.all([
                getPublicUserProfile(userId, { limit: 1, offset: 0 }),
                tab === "followers"
                    ? getPublicFollowers(userId, { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })
                    : getPublicFollowing(userId, { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
            ]);

            setProfile(nextProfile);
            setListData(nextList);
        } catch (loadError: any) {
            setError(loadError?.response?.data?.detail || loadError?.message || "Failed to load this network list.");
        } finally {
            setLoading(false);
        }
    }, [page, tab, userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (!next.get("page")) next.set("page", "1");
            if (!next.get("tab")) next.set("tab", "followers");
            return next;
        });
    }, [setSearchParams]);

    const totalPages = useMemo(() => {
        const total = listData?.total || 0;
        return Math.max(1, Math.ceil(total / PAGE_SIZE));
    }, [listData]);

    const updateTab = (nextTab: "followers" | "following") => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("tab", nextTab);
            next.set("page", "1");
            return next;
        });
    };

    const updatePage = (nextPage: number) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("page", String(nextPage));
            return next;
        });
    };

    const handleManage = useAuthAction(async (item: PublicUserConnectionItem) => {
        if (!isOwnProfile) return;

        setActionLoadingId(item.id);
        setError(null);

        try {
            if (tab === "followers") {
                await removeFollower(item.id);
            } else {
                await unfollowUser(item.id);
            }

            setListData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    items: prev.items.filter((entry) => entry.id !== item.id),
                    total: Math.max(0, prev.total - 1),
                };
            });
            setProfile((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    stats: {
                        ...prev.stats,
                        followersCount: tab === "followers" ? Math.max(0, prev.stats.followersCount - 1) : prev.stats.followersCount,
                        followingCount: tab === "following" ? Math.max(0, prev.stats.followingCount - 1) : prev.stats.followingCount,
                    },
                };
            });
        } catch (actionError: any) {
            setError(actionError?.response?.data?.detail || actionError?.message || "Failed to update this relationship.");
        } finally {
            setActionLoadingId(null);
        }
    });

    return (
        <CContainer className="user-connections-page">
            {error && <div className="user-connections-alert error">{error}</div>}

            <section className="user-connections-header">
                <div>
                    <h1>{profile?.user.username || "Collector"} Network</h1>
                    <p>Browse followers and following. On your own page, you can remove followers or unfollow directly from the list.</p>
                </div>
                <div className="user-connections-header-actions">
                    <CButton theme="outline-primary" onClick={() => navigate(`/users/${userId}`)}>
                        Back to Profile
                    </CButton>
                </div>
            </section>

            <section className="user-connections-tabs">
                <button
                    type="button"
                    className={`user-connections-tab ${tab === "followers" ? "active" : ""}`}
                    onClick={() => updateTab("followers")}
                >
                    Followers ({profile?.stats.followersCount || 0})
                </button>
                <button
                    type="button"
                    className={`user-connections-tab ${tab === "following" ? "active" : ""}`}
                    onClick={() => updateTab("following")}
                >
                    Following ({profile?.stats.followingCount || 0})
                </button>
            </section>

            <section className="user-connections-list-panel">
                {loading ? (
                    <div className="user-connections-list">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div className="user-connections-row user-connections-row-skeleton" key={`connection-skeleton-${index}`}>
                                <CSkeleton className="user-connections-avatar-skeleton" />
                                <div className="user-connections-copy">
                                    <CSkeleton variant="text" className="user-connections-line title" />
                                    <CSkeleton variant="text" className="user-connections-line body" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="user-connections-list">
                            {(listData?.items || []).map((item) => (
                                <div className="user-connections-row" key={item.id}>
                                    <button
                                        type="button"
                                        className="user-connections-profile"
                                        onClick={() => navigate(`/users/${item.id}`)}
                                    >
                                        <div className="user-connections-avatar-frame">
                                            <CImage
                                                className="user-connections-avatar"
                                                src={item.profile_image_url || ""}
                                                defaultImage={defaultAvatar}
                                                alt={item.username ? `${item.username} profile` : "Collector profile"}
                                                objectFit="cover"
                                            />
                                        </div>
                                        <div className="user-connections-copy">
                                            <strong>{item.username || "Collector"}</strong>
                                            <span>{item.bio || "No bio yet."}</span>
                                        </div>
                                    </button>

                                    {isOwnProfile && (
                                        <div className="user-connections-actions">
                                            <CButton
                                                theme="outline-primary"
                                                onClick={() => handleManage(item)}
                                                disabled={actionLoadingId === item.id}
                                            >
                                                {actionLoadingId === item.id
                                                    ? "Updating..."
                                                    : tab === "followers"
                                                        ? "Remove Follower"
                                                        : "Unfollow"}
                                            </CButton>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {!listData?.items?.length && (
                            <div className="user-connections-empty">
                                No {tab} to show yet.
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="user-connections-pagination">
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(_, nextPage) => updatePage(nextPage)}
                                    variant="outlined"
                                    shape="rounded"
                                />
                            </div>
                        )}
                    </>
                )}
            </section>
        </CContainer>
    );
};

export default UserConnections;
