import "./UserHome.scss";

import { Pagination } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import defaultAvatar from "../../../assets/images/default-avatar.jpg";
import defaultItemImage from "../../../assets/images/default_item_image.jpg";
import { getPublicUserProfile, getFollowStatus, followUser, unfollowUser } from "../../../api/userApi";
import CButton from "../../../components/common/CButton";
import CContainer from "../../../components/common/CContainer";
import CImage from "../../../components/common/CImage";
import CSkeleton from "../../../components/common/CSkeleton";
import { BRAND_NAME } from "../../../constants/brand";
import { useAuthAction } from "../../../hooks/useAuthAction";
import { RootState } from "../../../store/store";
import { PublicUserCollectionSummary, PublicUserProfileResponse, FollowStatus } from "../../../types/User";
import { getCarCfnUrlByS3Url } from "../../../utils/carsUtil";

const PAGE_SIZE = 12;

const UserHome = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state: RootState) => state.user);
    const [page, setPage] = useState(1);
    const [profile, setProfile] = useState<PublicUserProfileResponse | null>(null);
    const [followStatus, setFollowStatus] = useState<FollowStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isOwnProfile = !!userId && !!currentUser?.id && currentUser.id === userId;
    const totalPages = useMemo(() => {
        const total = profile?.collections?.total || 0;
        return Math.max(1, Math.ceil(total / PAGE_SIZE));
    }, [profile]);

    useEffect(() => {
        setPage(1);
    }, [userId]);

    const loadProfile = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const nextProfile = await getPublicUserProfile(userId, {
                limit: PAGE_SIZE,
                offset: (page - 1) * PAGE_SIZE,
            });
            setProfile(nextProfile);
        } catch (loadError: any) {
            setError(loadError?.response?.data?.detail || loadError?.message || "Failed to load collector profile.");
        } finally {
            setLoading(false);
        }
    }, [page, userId]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    useEffect(() => {
        if (!userId || !currentUser?.id || isOwnProfile) {
            setFollowStatus(null);
            return;
        }

        getFollowStatus(userId)
            .then((status) => setFollowStatus(status))
            .catch(() => setFollowStatus(null));
    }, [currentUser?.id, isOwnProfile, userId]);

    const handleFollowToggle = useAuthAction(async () => {
        if (!userId || isOwnProfile) return;

        setFollowLoading(true);
        setError(null);

        try {
            const nextStatus = followStatus?.following
                ? await unfollowUser(userId)
                : await followUser(userId);

            setFollowStatus(nextStatus);
            setProfile((prev) => {
                if (!prev) return prev;

                const previousFollowing = !!followStatus?.following;
                const nextFollowersCount = Math.max(
                    0,
                    (prev.stats.followersCount || 0) + (previousFollowing ? -1 : 1),
                );

                return {
                    ...prev,
                    stats: {
                        ...prev.stats,
                        followersCount: nextFollowersCount,
                    },
                };
            });
        } catch (followError: any) {
            setError(followError?.response?.data?.detail || followError?.message || "Failed to update follow status.");
        } finally {
            setFollowLoading(false);
        }
    });

    const renderCollectionCard = (item: PublicUserCollectionSummary) => (
        <button
            type="button"
            key={item.carId}
            className="user-home-collection-card"
            onClick={() => navigate(`/car_detail?cid=${item.carId}`)}
        >
            <div className="user-home-collection-image-frame">
                    <CImage
                        className="user-home-collection-image"
                        src={getCarCfnUrlByS3Url(item.images?.[0]?.s3_url, 300) || ""}
                        defaultImage={defaultItemImage}
                    alt={item.title || "Collection item"}
                    objectFit="cover"
                />
            </div>
            <div className="user-home-collection-copy">
                <span className="user-home-collection-brand">{BRAND_NAME[item.brand || ""] || item.brand || "Unknown brand"}</span>
                <strong>{item.title || "Untitled car"}</strong>
                <span>{item.originalId || "No code"}</span>
            </div>
            <div className="user-home-collection-meta">
                <span>{item.totalCount || 0} owned</span>
                <span>{item.batchCount || 0} entries</span>
            </div>
        </button>
    );

    return (
        <CContainer className="user-home-page">
            {error && <div className="user-home-alert error">{error}</div>}

            <section className="user-home-hero">
                <div className="user-home-profile">
                    <div className="user-home-avatar-frame">
                        {loading ? (
                            <CSkeleton className="user-home-avatar-skeleton" />
                        ) : (
                            <CImage
                                className="user-home-avatar"
                                src={profile?.user?.profile_image_url || ""}
                                defaultImage={defaultAvatar}
                                alt={profile?.user?.username ? `${profile.user.username} profile` : "Collector profile"}
                                objectFit="cover"
                            />
                        )}
                    </div>

                    <div className="user-home-copy">
                        {loading ? (
                            <>
                                <CSkeleton variant="text" className="user-home-line user-home-line-title" />
                                <CSkeleton variant="text" className="user-home-line user-home-line-subtitle" />
                                <CSkeleton variant="text" className="user-home-line user-home-line-bio" />
                            </>
                        ) : (
                            <>
                                <h1>{profile?.user?.username || "Collector"}</h1>
                                <p className="user-home-meta-line">
                                    {followStatus?.isFriend ? "Friends" : "Collector"}
                                </p>
                                <p className="user-home-bio">
                                    {profile?.user?.bio || "This collector has not added a bio yet."}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="user-home-side">
                    <div className="user-home-stats">
                        <div>
                            <strong>{loading ? "..." : profile?.stats.collectionsCount || 0}</strong>
                            <span>Cars</span>
                        </div>
                        <button
                            type="button"
                            className="user-home-stat-card"
                            onClick={() => navigate(`/users/${userId}/network?tab=followers&page=1`)}
                        >
                            <strong>{loading ? "..." : profile?.stats.followersCount || 0}</strong>
                            <span>Followers</span>
                        </button>
                        <button
                            type="button"
                            className="user-home-stat-card"
                            onClick={() => navigate(`/users/${userId}/network?tab=following&page=1`)}
                        >
                            <strong>{loading ? "..." : profile?.stats.followingCount || 0}</strong>
                            <span>Following</span>
                        </button>
                    </div>

                    {!isOwnProfile && (
                        <div className="user-home-actions">
                            <CButton onClick={handleFollowToggle} disabled={followLoading}>
                                {followLoading ? "Updating..." : followStatus?.following ? "Unfollow" : "Follow"}
                            </CButton>
                        </div>
                    )}
                </div>
            </section>

            <section className="user-home-collections-panel">
                <div className="user-home-section-header">
                    <div>
                        <h2>Collection</h2>
                        <p>Public-facing collection overview for this collector. Trading activity and buyer feedback can layer in here later.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="user-home-collection-grid">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={`user-home-skeleton-${index}`} className="user-home-collection-card user-home-collection-card-skeleton">
                                <CSkeleton className="user-home-collection-skeleton-image" />
                                <CSkeleton variant="text" className="user-home-collection-skeleton-line" />
                                <CSkeleton variant="text" className="user-home-collection-skeleton-line short" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="user-home-collection-grid">
                            {(profile?.collections.items || []).map(renderCollectionCard)}
                        </div>

                        {!profile?.collections.items?.length && (
                            <div className="user-home-empty">
                                No collection entries are visible for this collector yet.
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="user-home-pagination">
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(_, nextPage) => setPage(nextPage)}
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

export default UserHome;
