// parent to the other api slices

// createSlice is used with createApi for backend communication, where fetchBase handles requests, and tagTypes defines the data types fetched from the API.
import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react'
import { BASE_URL } from '../constants'

const baseQuery = fetchBaseQuery({ baseUrl: BASE_URL })

// endpoints directly or injected from a seperate file
// this apiSlice is connected to the 'store'
export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Product', 'Order', 'User'],
  // we are INJECTION endpoints
  // instead of writting them here
  // thats why we bring parent into the children
  endpoints: (builder) => ({}),
})
