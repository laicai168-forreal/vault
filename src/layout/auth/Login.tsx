import React, { useCallback, useReducer } from 'react';
import { useSelector } from 'react-redux';
import { createSearchParams, useNavigate } from 'react-router';
import CButton from '../../components/common/CButton';
import CInfoBlock from '../../components/common/CInfoBlock';
import CInput from '../../components/common/CInput';
import useAppDispatch from '../../hooks/useAppDispatch';
import { RootState } from '../../store/store';
import '../../styles/Login.scss';
import CLink from '../../components/common/CLink';
import { sendConfirmEmail, signIn } from '../../store/auth/authSlice';

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
	const { error, needConfirmation } = useSelector((state: RootState) => state.auth);

	const handleSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		dispatch(signIn(signInData))
			.unwrap()
			.then(() => {
				navigate('/brands');
			})
			.catch((error) => {
				console.log(error)

			});
	}, [signInData]);

	const handleConfirmEmail = () => {
		if (signInData.userId) {
			dispatch(sendConfirmEmail(signInData.userId))
				.unwrap()
				.then(() => {
					navigate({
						pathname: "/confirm_registration",
						search: createSearchParams({
							confirm_email: signInData.userId,
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
			<CInfoBlock type='error' show={!!error}>
				{error}
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
				<CButton type='submit'>Sign In</CButton>

				<CLink href='/register' >Create an account</CLink>
				<CLink href='/forget_password' >Forget Password</CLink>
			</form>
			<div>
				<h3>Debug</h3>
				<div>{JSON.stringify(signInData)}</div>
			</div>
		</div>
	);
}
