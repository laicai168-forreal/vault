import './Cars.scss';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Backdrop, CircularProgress, Pagination } from '@mui/material';

import defaultImage from '../../assets/images/default_item_image.jpg';
import CFilterDropdown, { CFilterDropdownOption } from '../../components/CFilterDropdown';
import SearchItem from '../../components/SearchItem';
import { BRAND_NAME, PRODUCT_LINE } from '../../constants/brand';
import { getCars, resetCarList, setCurrentPage, updateSingleCar } from '../../store/cars/carsSlice';
import { AppDispatch, RootState } from '../../store/store';

import { useAuthAction } from '../../hooks/useAuthAction';
import { addUserCollection, deleteUserCollection, dislikeUserCollection, likeUserCollection } from '../../store/userCollection/userCollectionSlice';
import { CollectionEntry } from '../../types/UserCollection';
import { getCarCfnUrlByS3Url } from '../../utils/carsUtil';

export default function Cars() {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const { brands, carsByPage, currentPage, pageNum, pageLimit, loading, error } = useSelector((state: RootState) => state.cars);
	const { currentUser } = useSelector((state: RootState) => state.user);
	const [searchParams, setSearchParams] = useSearchParams();
	const [actionMenuValue, setActionMenuValue] = useState('');
	const brandOptions = useRef<CFilterDropdownOption[]>([]);
	const obrdOptions: CFilterDropdownOption[] = [
		{
			key: "notselected",
			value: "",
			displayText: "Order by release date",
		},
		{
			key: "0",
			value: "0",
			displayText: "Released time from old",
		},
		{
			key: "1",
			value: "1",
			displayText: "Released time from new",
		}
	]

	const brand = searchParams.get('brand') || '';
	const keyword = searchParams.get('key_word') || '';
	// const sort = searchParams.get('sort') || 'name';
	const page = parseInt(searchParams.get('page') || '1', 10);
	const obrd = searchParams.get('obrd') || '';
	const isAdmin = currentUser?.role === 'admin';

	const actionOptions = useMemo<CFilterDropdownOption[]>(() => {
		const options: CFilterDropdownOption[] = [
			{
				key: 'add-missing-car',
				value: 'add-missing-car',
				displayText: 'Add Missing Car',
				onClick: () => navigate('/cars/edit?actor=customer&intent=create'),
			},
			{
				key: 'my-suggestions',
				value: 'my-suggestions',
				displayText: 'My Suggestions',
				onClick: () => navigate('/cars/requests'),
			},
		];

		if (isAdmin) {
			options.push(
				{
					key: 'review-suggestions',
					value: 'review-suggestions',
					displayText: 'Review Suggestions',
					onClick: () => navigate('/admin/car-requests'),
				},
				{
					key: 'admin-maintenance',
					value: 'admin-maintenance',
					displayText: 'Admin Maintenance',
					onClick: () => navigate('/admin/cars'),
				},
			);
		}

		return options;
	}, [isAdmin, navigate]);

	const handleFilterChange = (key: string, value: string) => {
		const newParams = new URLSearchParams(searchParams);
		if (value) {
			newParams.set(key, value);
		} else {
			newParams.delete(key);
		}

		if (key === 'brand') newParams.set('page', '1');
		setSearchParams(newParams);
	};

	const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
		handleFilterChange('page', page.toString());
		dispatch(setCurrentPage(page));
	}

	const handleBrandChange = (brand: string) => {
		handleFilterChange('brand', brand);
	};

	const handleOBRDChange = (obrd: string) => {
		handleFilterChange('obrd', obrd);
	};

	useEffect(() => {
		const options: CFilterDropdownOption[] = [
			{ key: "all", value: "", displayText: "All Brand" },
			...brands.map(({ id, name }) => ({
				key: id,
				value: id,
				displayText: BRAND_NAME[name] || name,
			}))
		]

		brandOptions.current = options;
	}, [brands]);

	useEffect(() => {
		dispatch(resetCarList());
		dispatch(setCurrentPage(page));
		dispatch(getCars({ bid: brand, offset: (page - 1) * pageLimit, keyword, obrd }))
			.unwrap()
			.then()
			.catch((err) => {
				//TODO: handle error
			});
	}, [brand, dispatch, keyword, obrd, page, pageLimit, searchParams]);

	const handleAddCollection = useAuthAction((entity: CollectionEntry) => {
		dispatch(updateSingleCar({ id: entity.carId, loadingAdd: true }));
		dispatch(addUserCollection({ items: [entity] }))
			.unwrap()
			.then(() => {
				dispatch(updateSingleCar({ own: true, id: entity.carId, loadingAdd: false }))
			})
			.catch((e) => {
				//TODO: Handle error
				dispatch(updateSingleCar({ id: entity.carId, loadingAdd: false }))
			})
	});

	const handleDeleteCollection = useAuthAction((entity: CollectionEntry) => {
		if (!entity.carId) return;

		dispatch(updateSingleCar({ id: entity.carId, loadingAdd: true }));
		dispatch(deleteUserCollection(entity.carId))
			.unwrap()
			.then(() => {
				dispatch(updateSingleCar({ own: false, id: entity.carId, loadingAdd: false }))
			})
			.catch((e) => {
				//TODO: Handle error
				dispatch(updateSingleCar({ id: entity.carId, loadingAdd: false }))
			})
	});

	const handleLikeCollection = useAuthAction((entity: CollectionEntry) => {
		dispatch(updateSingleCar({ id: entity.carId, loadingLike: true }));
		dispatch(likeUserCollection(entity))
			.unwrap()
			.then(() => {
				dispatch(updateSingleCar({ liked: true, id: entity.carId, loadingLike: false }))
			})
			.catch((e) => {
				//TODO: Handle error
				dispatch(updateSingleCar({ id: entity.carId, loadingLike: false }))
			})
	});

	const handleDislikeCollection = useAuthAction((entity: CollectionEntry) => {
		if (!entity.carId) return;
		
		dispatch(updateSingleCar({ id: entity.carId, loadingLike: true }));
		dispatch(dislikeUserCollection(entity.carId))
			.unwrap()
			.then(() => {
				dispatch(updateSingleCar({ liked: false, id: entity.carId, loadingLike: false }))
			})
			.catch((e) => {
				//TODO: Handle error
				dispatch(updateSingleCar({ id: entity.carId, loadingLike: false }))
			})
	});

	const handleViewCar = useCallback((cid: string) => {
		navigate(`/car_detail?cid=${cid}`);
	}, [navigate])

	const handleSuggestEdit = useCallback((cid: string) => {
		navigate(`/cars/edit?actor=customer&intent=suggest&cid=${cid}`);
	}, [navigate]);

	return (
		<div className='car-grid-container'>
			<Backdrop
				sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
				open={loading}
			>
				<CircularProgress color="inherit" />
			</Backdrop>
			<div className='car-filter'>
				<div className='car-filter-section'>
					<div className='car-filter-section-label'>Filters</div>
					<div className='car-filter-controls'>
						<CFilterDropdown
							value={brand}
							options={brandOptions.current}
							onChange={(value) => handleBrandChange(value)}
						/>
						<CFilterDropdown
							value={obrd}
							options={obrdOptions}
							onChange={(value) => handleOBRDChange(value)}
						/>
					</div>
				</div>
				<div className='car-filter-divider' />
				<div className='car-filter-section car-filter-section-tools'>
					<div className='car-filter-section-label'>Tools</div>
					<div className='car-filter-actions'>
						<CFilterDropdown
							value={actionMenuValue}
							options={actionOptions}
							placeholder='Tools'
							onChange={() => setActionMenuValue('')}
						/>
					</div>
				</div>
			</div>

			<div className='car-grid'>
				{
					carsByPage[page] &&
					carsByPage[page].map((car) => (
						<div key={car.id} className='car-card'>
							<SearchItem
								img={getCarCfnUrlByS3Url(car.images?.[0]?.s3_url, 700) ?? defaultImage}
								brand={PRODUCT_LINE[car.product_line || ''] || BRAND_NAME[car.brand]}
								title={car.title}
								originalId={car.original_id || ''}
								make={car.make}
								makeAi={car.make_ai}
								releaseDateApproximate={car.release_date_approximate}
								releaseDateAi={car.release_date_ai}
								carId={car.id}
								loadingAdd={car.loadingAdd}
								loadingLike={car.loadingLike}
								own={car.own}
								like={car.liked}
								onAdd={car.own ? handleDeleteCollection : handleAddCollection}
								onLike={car.liked ? handleDislikeCollection : handleLikeCollection}
								onView={handleViewCar}
								onSuggestEdit={handleSuggestEdit}
							/>
						</div>
					))}
			</div>
			{
				loading && <div>Loading Cars...</div>
			}
			{
				error && <div>Error: {error}</div>
			}
			{
				!loading && !carsByPage[page] && "No items available ..."
			}
			{
				!loading &&
				<Pagination
					count={pageNum}
					page={currentPage}
					onChange={(event, page) => handlePageChange(event, page)}
					variant="outlined"
					shape="rounded"
				/>
			}
		</div>
	)
}
