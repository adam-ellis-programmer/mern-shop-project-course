// property is a key value pair
// this is the parent to the rest of the slices we create
// Boilerplate code
import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '../slices/apiSlice'

import cartSliceReducer from '../slices/cartSlice'
import authSliceReducer from '../slices/authSlice'

// as we add reducers we can see them in dev tools
export default configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    cart: cartSliceReducer,
    auth: authSliceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    // function provides the default middleware set from Redux Toolkit, which includes: redux-thunk for handling asynchronous actions.
    // concat(apiSlice.middleware): Combines the default middleware array with the apiSlice.middleware, ensuring both are applied.
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
})
