import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import '../../styles/Account.scss';
import { useSelector } from 'react-redux';
import CButton from '../../components/common/CButton';
import CInfoBlock from '../../components/common/CInfoBlock';
import CInput from '../../components/common/CInput';
import useAppDispatch from '../../hooks/useAppDispatch';
import { RootState } from '../../store/store';
import { clearUserMessage, fetchCurrentUser, saveCurrentUser } from '../../store/user/userSlice';
import { createProfileImageUpload } from '../../api/userApi';
import defaultAvatar from '../../assets/images/default-avatar.jpg';

export default function Account() {
	const dispatch = useAppDispatch();
	const { currentUser, loading, saving, error, saveMessage, initialized } = useSelector((state: RootState) => state.user);
	const { isAuthenticated } = useSelector((state: RootState) => state.auth);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [formData, updateFormData] = useReducer((prev: any, next: any) => ({
		...prev,
		...next,
	}), {
		bio: '',
		address: '',
		age: '',
		profileImageUrl: '',
		pendingProfileImageKey: '',
	});
	const [uploadingImage, setUploadingImage] = useState(false);

	useEffect(() => {
		if (isAuthenticated && !loading && !currentUser && !initialized) {
			dispatch(fetchCurrentUser());
		}
	}, [currentUser, dispatch, initialized, isAuthenticated, loading]);

	useEffect(() => {
		updateFormData({
			bio: currentUser?.bio || '',
			address: currentUser?.address || '',
			age: currentUser?.age?.toString() || '',
			profileImageUrl: currentUser?.profileImageUrl || '',
			pendingProfileImageKey: '',
		});
	}, [currentUser]);

	useEffect(() => {
		return () => {
			dispatch(clearUserMessage());
		};
	}, [dispatch]);

	const profileName = useMemo(() => {
		return currentUser?.username || currentUser?.email || 'Malo User';
	}, [currentUser]);

	const displayProfileImage = useMemo(() => {
		return formData.profileImageUrl || currentUser?.profileImageUrl || '';
	}, [currentUser, formData.profileImageUrl]);

	const handleChooseProfileImage = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleProfileImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			setUploadingImage(true);
			const upload = await createProfileImageUpload({
				fileName: file.name,
				contentType: file.type || 'application/octet-stream',
			});

			await fetch(upload.uploadUrl, {
				method: 'PUT',
				headers: {
					'Content-Type': file.type || 'application/octet-stream',
				},
				body: file,
			});

			updateFormData({
				profileImageUrl: upload.fileUrl,
				pendingProfileImageKey: upload.objectKey,
			});
		} catch (uploadError: any) {
			console.error(uploadError);
		} finally {
			setUploadingImage(false);
			event.target.value = '';
		}
	}, []);

	const handleSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		dispatch(saveCurrentUser({
			bio: formData.bio || null,
			address: formData.address || null,
			age: formData.age ? Number(formData.age) : null,
			pendingProfileImageKey: formData.pendingProfileImageKey || null,
		}));
	}, [dispatch, formData]);

	return (
		<div className="container">
			<h1>Hi {profileName}!</h1>
			<CInfoBlock type='error' show={!!error}>
				{error}
			</CInfoBlock>
			<CInfoBlock type='success' show={!!saveMessage}>
				{saveMessage}
			</CInfoBlock>
			<form className="account-form" onSubmit={handleSubmit} noValidate>
				<div className="account-profile-image-section">
					<div className="account-profile-image-frame">
						{
							displayProfileImage ? (
								<img
									className="account-profile-image"
									src={displayProfileImage}
									alt={`${profileName} profile`}
								/>
							) : (
								<div className="account-profile-image-placeholder">
									Add a profile image
								</div>
							)
						}
					</div>
					<div className="account-profile-image-actions">
						<CButton
							type="button"
							onClick={handleChooseProfileImage}
							loading={uploadingImage}
							disabled={saving}
						>
							{displayProfileImage ? 'Replace Profile Image' : 'Add Profile Image'}
						</CButton>
						<p className="account-profile-image-hint">
							Upload first, then save the profile to confirm the new image.
						</p>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							style={{ display: 'none' }}
							onChange={handleProfileImageChange}
						/>
					</div>
				</div>

				<div className="account-field-grid">
					<CInput
						label='Username'
						name='username'
						value={currentUser?.username || ''}
						disabled
					/>
					<CInput
						label='Email'
						name='email'
						value={currentUser?.email || ''}
						disabled
					/>
					<CInput
						label='Phone'
						name='phone'
						value={currentUser?.phoneNumber || ''}
						disabled
					/>
					<CInput
						label='Age'
						fieldKey='age'
						name='age'
						type='number'
						value={formData.age}
						onChange={updateFormData}
					/>
				</div>
				<CInput
					label='Address'
					fieldKey='address'
					name='address'
					value={formData.address}
					onChange={updateFormData}
				/>
				<CInput
					label='Bio'
					fieldKey='bio'
					name='bio'
					value={formData.bio}
					onChange={updateFormData}
					multiline
					rows={6}
				/>

				<div className="account-actions">
					<CButton type="submit" loading={saving} disabled={loading || uploadingImage}>
						Update Profile
					</CButton>
				</div>
			</form>
		</div>
	);
}
