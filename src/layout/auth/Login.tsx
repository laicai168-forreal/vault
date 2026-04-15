import React, { useCallback, useEffect, useReducer } from 'react';
import { useSelector } from 'react-redux';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router';
import CButton from '../../components/common/CButton';
import CInfoBlock from '../../components/common/CInfoBlock';
import CInput from '../../components/common/CInput';
import useAppDispatch from '../../hooks/useAppDispatch';
import { RootState } from '../../store/store';
import '../../styles/Login.scss';
import CLink from '../../components/common/CLink';
import { sendConfirmEmail, signIn } from '../../store/auth/authSlice';
import { bootstrapCurrentUser } from '../../store/user/userSlice';

interface formData {
	name?: string;
	address?: string;
	email?: string;
	phone?: string;
}

export default function Login() {
	const title = 'Welcome back! Please sign in to your account'

	const [signInData, updateSignInData] = useReducer((prev, next) => {
		return { ...prev, ...next }
	}, { userId: '', password: '' });

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { error, needConfirmation, loading } = useSelector((state: RootState) => state.auth);
	const { error: profileError } = useSelector((state: RootState) => state.user);

	useEffect(() => {
		const username = searchParams.get('username');

		if (username) {
			updateSignInData({ userId: username });
		}
	}, [searchParams]);

	const handleSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		dispatch(signIn(signInData))
			.unwrap()
			.then(async (authData) => {
				await dispatch(bootstrapCurrentUser(authData.idToken)).unwrap();
				navigate('/cars');
			})
			.catch((error) => {
				console.log(error)

			});
	}, [dispatch, navigate, signInData]);

	const handleConfirmEmail = () => {
		if (signInData.userId) {
			dispatch(sendConfirmEmail(signInData.userId))
				.unwrap()
						.then(() => {
							navigate({
								pathname: "/confirm_registration",
								search: createSearchParams({
									username: signInData.userId,
								}).toString(),
							});
						})
				.catch((error) => {
					console.log(error)
				})
		}
	}

	return (
		<div className="container">
			<h2 className="main-title">{title}</h2>
			<CInfoBlock type='success' show={searchParams.get('confirmed') === '1'}>
				Registration confirmed. Sign in to finish creating your profile.
			</CInfoBlock>
			<CInfoBlock type='error' show={!!error}>
				{error}
			</CInfoBlock>
			<CInfoBlock type='error' show={!!profileError && !error}>
				{profileError}
			</CInfoBlock>
			<form onSubmit={handleSubmit} noValidate>
				<CInput
					value={signInData.userId}
					label='Email'
					type='text'
					name='userId'
					fieldKey='userId'
					onChange={updateSignInData}
				/>
				{needConfirmation &&
					<div>
						<CButton onClick={handleConfirmEmail}>Confirm This Email</CButton>

					</div>}
				<CInput
					value={signInData.password}
					label='Password'
					type='password'
					name='password'
					fieldKey='password'
					onChange={updateSignInData}
				/>
				<CButton type='submit' loading={loading}>Sign In</CButton>

				<CLink href='/register' >Create an account</CLink>
				<CLink href='/forget_password' >Forget Password</CLink>
			</form>
		</div>
	);
}
