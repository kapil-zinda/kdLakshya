import { OrganizationConfig } from '@/types/organization';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrganizationState {
  data: OrganizationConfig | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp
}

const initialState: OrganizationState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setOrganizationData: (state, action: PayloadAction<OrganizationConfig>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
      state.lastFetched = Date.now();
    },
    setOrganizationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setOrganizationError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearOrganizationData: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
    },
  },
});

export const {
  setOrganizationData,
  setOrganizationLoading,
  setOrganizationError,
  clearOrganizationData,
} = organizationSlice.actions;

export default organizationSlice.reducer;
