import React, { useCallback, useState } from 'react';
import '../../styles/Account.scss';

interface formData {
	name?: string;
	address?: string;
	email?: string;
	phone?: string;
}

export default function Account() {
	//TODO: get from store
	const name = 'Malo User'

	const [formData, setFormData] = useState<formData>({
		name: '',
		address: '',
		email: '',
		phone: '',
	});

	const [message, setMessage] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const validateName = useCallback(() => {

	}, []);

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
	}, [formData]);

	const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {

	}, []);

	const handleSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		mockSubmitRequest().then((message: string) => {
			setMessage(message);
		});
	}, [formData]);

	const mockSubmitRequest = (): Promise<string> => {
		setIsSubmitting(true);
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const timeStamp = new Date();
				setIsSubmitting(false);
				resolve(`Updated at ${timeStamp.toLocaleString()}`);
			}, 1000);
		});
	};

	return (
		<div className="container">
			<h1>Hi {name}!</h1>
			<form onSubmit={handleSubmit} noValidate>
				<div className="form-row">
					<label className="form-label">Name</label>
					<input
						className='form-input'
						type='text'
						name='name'
						value={formData.name}
						onChange={handleChange}
						onBlur={handleBlur}
					/>
				</div>
				<div className="form-row">
					<label className="form-label">Address</label>
					<input
						className='form-input'
						type='text'
						name='address'
						value={formData.address}
						onChange={handleChange}
						onBlur={handleBlur}
					/>
				</div>
				<div className="form-row">
					<label className="form-label">Email</label>
					<input
						className='form-input'
						type='text'
						name='email'
						value={formData.email}
						onChange={handleChange}
						onBlur={handleBlur}
					/>
				</div>

				<button type="submit" disabled={isSubmitting}>
					Update
				</button>
			</form>
			<div>
				{message}
			</div>
			<div>
				<h3>Debug</h3>
				<div>{JSON.stringify(formData)}</div>
			</div>
		</div>
	);
}
