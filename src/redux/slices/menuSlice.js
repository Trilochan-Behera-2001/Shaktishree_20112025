import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../../api/userApi";


export const fetchMenu = createAsyncThunk(
  "menu/fetchMenu",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userApi.getMenu();
      return res.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Menu fetch failed");
    }
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default menuSlice.reducer;
