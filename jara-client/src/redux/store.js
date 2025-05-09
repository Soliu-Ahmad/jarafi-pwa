import { configureStore } from "@reduxjs/toolkit";
import pinReducer from "./pinSlice";

export default configureStore({
  reducer: {
    pin: pinReducer,
  },
});
