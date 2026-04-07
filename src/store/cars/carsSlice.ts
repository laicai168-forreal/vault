import { ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchCarById, fetchCars, GetCarParams } from '../../api/carApi';
import { Car } from '../../types/Car';

export interface CarsState {
	cars: Car[];
	currentCar?: Car;
	carsByPage: Record<number, Car[]>,
	brands: { id: string; name: string }[];
	currentPage: number;
	pageNum: number;
	pageLimit: number;
	totalCount: number;
	loading: boolean;
	error: string | null;
}

const initialState: CarsState = {
	cars: [],
	carsByPage: {},
	brands: [],
	currentPage: 1,
	pageNum: 0,
	pageLimit: 20,
	totalCount: 0,
	loading: false,
	error: null,
};

export const getCars = createAsyncThunk(
	'cars/getCars',
	async (params: GetCarParams, { rejectWithValue }) => {
		try {
			const cars = await fetchCars(params);
			return cars;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const getCarById = createAsyncThunk(
	'cars/getCarById',
	async (cid: string, { rejectWithValue }) => {
		try {
			const cars = await fetchCarById(cid);
			return cars;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

const setCurrentPageAction = (state: CarsState, action: PayloadAction<number>) => {
	state.currentPage = action.payload;
}

const updateSingleCarAction = (state: CarsState, action: PayloadAction<Partial<Car>>) => {
	state.carsByPage[state.currentPage] = state.carsByPage[state.currentPage].map((c) => action.payload.id === c.id ? { ...c, ...action.payload } : { ...c });
}

const updateCurrentCarAction = (state: CarsState, action: PayloadAction<Partial<Car>>) => {
	state.currentCar = state.currentCar && { ...state.currentCar, ...action.payload };
}

const resetCarListAction = (state: CarsState) => {
	state.cars = [];
}

const getCarsAction = (builder: ActionReducerMapBuilder<CarsState>) => {
	builder
		.addCase(getCars.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(getCars.fulfilled, (state, action: PayloadAction<any>) => {
			state.loading = false;
			state.cars = [...state.cars, ...action.payload.items];
			if (action.payload.items) {
				state.carsByPage = { ...state.carsByPage, [state.currentPage]: action.payload.items };
			}
			state.pageNum = action.payload.pages;
			state.totalCount = action.payload.total;
			state.brands = action.payload.brands;
		})
		.addCase(getCars.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});
}

const getCarByIdAction = (builder: ActionReducerMapBuilder<CarsState>) => {
	builder
		.addCase(getCarById.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(getCarById.fulfilled, (state, action: PayloadAction<any>) => {
			state.loading = false;
			state.currentCar = action.payload;
		})
		.addCase(getCarById.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});
}

const carSlice = createSlice({
	name: 'cars',
	initialState,
	reducers: {
		updateSingleCar: updateSingleCarAction,
		updateCurrentCar: updateCurrentCarAction,
		resetCarList: resetCarListAction,
		setCurrentPage: setCurrentPageAction,
	},
	extraReducers: (builder) => {
		getCarsAction(builder);
		getCarByIdAction(builder);
	},
})
const carReducer = carSlice.reducer;

export default carReducer;
export const {
	updateSingleCar,
	updateCurrentCar,
	resetCarList,
	setCurrentPage,
} = carSlice.actions