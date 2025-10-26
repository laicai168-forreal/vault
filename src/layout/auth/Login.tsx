import React, { useCallback, useReducer, useState } from 'react';
import '../../styles/Login.scss';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { signIn, SignInData } from '../../store/auth/authSlice';
import { useSelector } from 'react-redux';
import useAppDispatch from '../../hooks/useAppDispatch';
import { Navigate, useNavigate } from 'react-router';

interface formData {
	name?: string;
	address?: string;
	email?: string;
	phone?: string;
}

export default function Login() {
	const title = 'Welcome back! Please sign in to your account'

	const [signInData, updateSignInData] = useReducer((prev, next) =>{
		return {...prev, ...next}
	}, {userId: '', password: ''});

	const [message, setMessage] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const handleSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		dispatch(signIn(signInData)).then(() => {
			navigate('/all');
		});
	}, [signInData]);
	

	return (
		<div className="container">
			<h2 className="main-title">{title}</h2>
			<form onSubmit={handleSubmit} noValidate>
				<div className="form-row">
					<label className="form-label">ID</label>
					<input
						className='form-input'
						type='text'
						name='name'
						value={signInData.userId}
						onChange={e => updateSignInData({userId: e.target.value})}
					/>
				</div>
				<div className="form-row">
					<label className="form-label">Email</label>
					<input
						className='form-input'
						type='password'
						name='password'
						value={signInData.password}
						onChange={e => updateSignInData({password: e.target.value})}
					/>
				</div>

				<button className="sign-in-button" type="submit" disabled={isSubmitting}>
					Sign In
				</button>
			</form>
			<div>
				{message}
			</div>
			<div>
				<h3>Debug</h3>
				<div>{JSON.stringify(signInData)}</div>
			</div>
		</div>
	);
}
