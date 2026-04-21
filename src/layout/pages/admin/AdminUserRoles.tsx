import "./AdminUserRoles.scss";

import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { AdminUserListItem, deleteAdminUser, listAdminUsers, promoteUserRole } from "../../../api/userApi";
import CButton from "../../../components/common/CButton";
import CInput from "../../../components/common/CInput";
import { RootState } from "../../../store/store";

const AdminUserRoles = () => {
    const navigate = useNavigate();
    const { currentUser, loading: userLoading } = useSelector((state: RootState) => state.user);
    const [keyword, setKeyword] = useState("");
    const [users, setUsers] = useState<AdminUserListItem[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
    const [cognitoSub, setCognitoSub] = useState("");
    const [role, setRole] = useState<"customer" | "admin">("admin");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const isAdmin = currentUser?.role === "admin";

    const loadUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const response = await listAdminUsers({
                keyword: keyword.trim() || undefined,
                limit: 50,
                offset: 0,
            });
            setUsers(response.items || []);
        } catch (loadError: any) {
            setError(loadError?.response?.data?.detail || loadError?.message || "Failed to load users.");
        } finally {
            setUsersLoading(false);
        }
    }, [keyword]);

    useEffect(() => {
        if (!isAdmin) return;
        loadUsers();
    }, [isAdmin, loadUsers]);

    const handleSubmit = async () => {
        if (!cognitoSub.trim()) {
            setError("Cognito sub is required.");
            setSuccess(null);
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await promoteUserRole({
                cognitoSub: cognitoSub.trim(),
                role,
            });
            setSuccess(`User role updated to ${response.role}.`);
        } catch (submitError: any) {
            setError(submitError?.response?.data?.detail || submitError?.message || "Failed to update user role.");
        } finally {
            setSaving(false);
        }
    };

    const handleUserPick = (user: AdminUserListItem) => {
        setSelectedUser(user);
        setCognitoSub(user.cognitoSub || "");
        setRole((user.role as "customer" | "admin") || "customer");
        setError(null);
        setSuccess(null);
    };

    const handleDelete = async () => {
        if (!selectedUser?.id) {
            setError("Pick a user from the list before deleting.");
            setSuccess(null);
            return;
        }

        const label = selectedUser.username || selectedUser.email || selectedUser.cognitoSub || selectedUser.id;
        if (!window.confirm(`Delete user "${label}" from the database? This cannot be undone.`)) {
            return;
        }

        setDeleting(true);
        setError(null);
        setSuccess(null);

        try {
            await deleteAdminUser(selectedUser.id);
            setSuccess("User deleted.");
            setSelectedUser(null);
            setCognitoSub("");
            setRole("customer");
            await loadUsers();
        } catch (deleteError: any) {
            setError(deleteError?.response?.data?.detail || deleteError?.message || "Failed to delete user.");
        } finally {
            setDeleting(false);
        }
    };

    const isSelectedSelf = selectedUser?.id && selectedUser.id === currentUser?.id;

    return (
        <div className="admin-user-roles-page">
            {!userLoading && !isAdmin && (
                <div className="admin-user-roles-alert error">Admin access is required for this page.</div>
            )}

            {isAdmin && (
                <>
                    <div className="admin-user-roles-header">
                        <div>
                            <h1>Admin User Roles</h1>
                            <p>Promote a user, move an admin back to customer, or delete a user account from the database when it is safe to do so.</p>
                        </div>
                        <div className="admin-user-roles-header-actions">
                            <CButton theme="outline-primary" onClick={() => navigate("/admin/cars")}>
                                Admin Maintenance
                            </CButton>
                            <CButton theme="mono" onClick={() => navigate("/admin/car-requests")}>
                                Review Suggestions
                            </CButton>
                        </div>
                    </div>

                    <div className="admin-user-roles-card">
                        <div className="admin-user-roles-layout">
                            <div className="admin-user-roles-browser">
                                <CInput
                                    label="Find user"
                                    value={keyword}
                                    placeholder="Search by username, email, or Cognito sub"
                                    onChange={(value) => setKeyword(typeof value === "string" ? value : "")}
                                />

                                <div className="admin-user-roles-user-list">
                                    {usersLoading && <div className="admin-user-roles-user-empty">Loading users...</div>}

                                    {!usersLoading && users.length === 0 && (
                                        <div className="admin-user-roles-user-empty">No users matched your search.</div>
                                    )}

                                    {!usersLoading && users.map((user) => (
                                        <button
                                            key={user.id || user.cognitoSub}
                                            type="button"
                                            className="admin-user-roles-user-row"
                                            onClick={() => handleUserPick(user)}
                                        >
                                            <div className="admin-user-roles-user-copy">
                                                <strong>{user.username || "Unnamed user"}</strong>
                                                <span>{user.email || user.cognitoSub || "No identifier"}</span>
                                            </div>
                                            <span className={`admin-user-roles-role-pill ${user.role || "customer"}`}>
                                                {user.role || "customer"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="admin-user-roles-form-panel">
                                <div className="admin-user-roles-form">
                                    <CInput
                                        label="Cognito sub"
                                        value={cognitoSub}
                                        placeholder="us-east-1 user sub"
                                        onChange={(value) => setCognitoSub(typeof value === "string" ? value : "")}
                                    />

                                    <div className="admin-user-roles-field">
                                        <label className="admin-user-roles-label">Role</label>
                                        <select
                                            className="admin-user-roles-select"
                                            value={role}
                                            onChange={(event) => setRole(event.target.value as "customer" | "admin")}
                                        >
                                            <option value="admin">admin</option>
                                            <option value="customer">customer</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="admin-user-roles-actions">
                                    <CButton theme="outline-primary" onClick={handleDelete} disabled={deleting || saving || !selectedUser?.id || !!isSelectedSelf}>
                                        {deleting ? "Deleting..." : "Delete User"}
                                    </CButton>
                                    <CButton onClick={handleSubmit} disabled={saving || deleting}>
                                        {saving ? "Updating..." : "Update Role"}
                                    </CButton>
                                </div>
                                {isSelectedSelf && (
                                    <div className="admin-user-roles-inline-note">
                                        Your own admin account cannot be deleted from this page.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && <div className="admin-user-roles-alert error">{error}</div>}
                    {success && <div className="admin-user-roles-alert info">{success}</div>}

                    <div className="admin-user-roles-help">
                        <span>Need to find the user first?</span>
                        <Link to="/account" className="admin-user-roles-link">Go to my profile</Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminUserRoles;
