import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_SERVER_URL;

// console.log({API_URL})

const initialState = {
  pin: null,
  isSuccess: false,
  isError: false,
  message: "",
  isLoading: false,
};

export const setPin = createAsyncThunk(
  "pin/set-pin",
  async (pinData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/api/pin/set-pin`, pinData);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getPin = createAsyncThunk(
  "pin/get-pin",
  async ({ wallet, pin }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/api/pin/get-pin`, {
        wallet,
        pin,
      });

      // console.log(response.data )
      return response.data;
    } catch (error) {
      const message =
        (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const pinSlice = createSlice({
  name: "pin",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setPin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(setPin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.pin = action.payload;
      })
      .addCase(setPin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getPin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.pin = action.payload;
      })
      .addCase(getPin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = pinSlice.actions;
export default pinSlice.reducer;
