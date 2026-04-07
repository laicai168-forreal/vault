import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FilterData {
    brand: string;
    keyword: string;
    obrd: string;
}

export interface FilterState {
    filterData: FilterData;
}

const initialState: FilterState = {
    filterData: {
        brand: "",
        keyword: "",
        obrd: "",
    }
};

export const updateFilterAction = (state: FilterState, action: PayloadAction<Partial<FilterData>>) => {
    state.filterData = { ...state.filterData, ...action.payload };
}

const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        updateFilter: updateFilterAction
    },
})
const filterReducer = filterSlice.reducer;

export default filterReducer;
export const {
    updateFilter,
} = filterSlice.actions