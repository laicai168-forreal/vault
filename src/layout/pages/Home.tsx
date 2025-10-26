import React, { useCallback } from 'react';
import logo from './logo.svg';
import '../../styles/Home.scss';
import { useNavigate } from 'react-router-dom';
import ScrollLoader from '../../components/ScrollLoader';

const Home = () => {
	const navigate = useNavigate();

	const handleNavigate = useCallback(() => {
		navigate('account');
	}, []);

	return (
		<div className='home-container'>
			<ScrollLoader bufferSize={24} optimizeByVisibility/>
		</div>
	);
}

export default Home;
