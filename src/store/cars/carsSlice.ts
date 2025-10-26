import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchCars } from '../../api/carApi';

interface Car {
    product_url: string,
    page_id: string,
    brand: string,
    summary: string,
    last_crawled: string,
    raw_html_snippet: string,
    slug: string,
    details: {
      Status: string,
      Scale: string,
      Marque: string,
      id: string
    },
    image_url: string,
    id: string,
    image_s3_key: string,
    image_s3_url: string,
    title: string,
    own?: boolean,
    want?: boolean,
}

interface CarsState {
  cars: Car[];
  loading: boolean;
  error: string | null;
}

const initialState: CarsState = {
  cars: [],
  loading: false,
  error: null,
};

const _updateSingleCar = (state: CarsState, action: PayloadAction<Partial<Car>>) => {
    state.cars = state.cars.map((c) => action.payload.id === c.id ? {...c, ...action.payload} : {...c});
}

export const getCars = createAsyncThunk(
  'cars/getCars',
  async (_, { rejectWithValue }) => {
    try {
      const cars = await fetchCars();
      return cars;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const carSlice = createSlice({
  name: 'cars',
  initialState,
  reducers: {
    updateSingleCar: _updateSingleCar
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCars.fulfilled, (state, action: PayloadAction<Car[]>) => {
        state.loading = false;
        state.cars = action.payload;
      })
      .addCase(getCars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
})
const carReducer = carSlice.reducer;

export default carReducer;
export const {
    updateSingleCar,
} = carSlice.actions