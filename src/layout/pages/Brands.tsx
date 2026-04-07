import '../../styles/Brands.scss';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { useSelector } from 'react-redux';
import { BrandEnum, BrandMap } from '../../constants/car';
import BrandBadge from '../../components/BrandBadge';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

const Brands = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { cars, loading, error } = useSelector((state: RootState) => state.cars);
	const navigate = useNavigate();

	const handleBrandClick = useCallback((brandKey: BrandEnum) => {
		navigate(`/cars?brand=${brandKey}`)
	}, [])

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<div>
			<div className='brands-grid'>
				{Object.entries(BrandMap).map(([key, brand]) => (
					<div key={brand.key} className='brand-card'>
						<BrandBadge image={brand.image} onClick={() => handleBrandClick(brand.key)} />
					</div>
				))}
			</div>
		</div>
	)
}

export default Brands;
