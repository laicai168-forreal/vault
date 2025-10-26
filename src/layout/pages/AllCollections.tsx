import React, { useCallback, useEffect } from 'react';
import '../../styles/All.scss';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { useSelector } from 'react-redux';
import { getCars, updateSingleCar } from '../../store/cars/carsSlice';
import SearchItem from '../../components/SearchItem';
import { addUserCollection, deleteUserCollection, getUserCollection } from '../../store/userCollection/userCollectionSlice';
import { AddCollectionEntity } from '../../types/UserCollection';

export default function AllCollections() {
  const dispatch = useDispatch<AppDispatch>();
  const { cars, loading, error } = useSelector((state: RootState) => state.cars);

  useEffect(() => {
    dispatch(getCars());
    dispatch(getUserCollection());
  }, [dispatch]);

  const handleAddCollection = useCallback((entity: AddCollectionEntity) => {
    dispatch(addUserCollection(entity)).then(() => {
      dispatch(updateSingleCar({ own: true, id: entity.carId }))
    })
  }, [dispatch]);

  const handleDeleteCollection = useCallback((entity: AddCollectionEntity) => {
    dispatch(deleteUserCollection(entity)).then(() => {
      dispatch(updateSingleCar({ own: false, id: entity.carId }))
    })
  }, [dispatch]);

  if (loading) {
    return <div>Loading Cars...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className='car-grid'>
        {cars.map((car) => (
          <div key={car.id} className='car-card'>
            <SearchItem
              img={car.image_s3_url}
              title={car.title}
              sku={car.id}
              own={car.own || false}
              onAdd={handleAddCollection}
              onDelete={handleDeleteCollection}
            />
          </div>
        ))}
      </div>
    </div>

  )
}
