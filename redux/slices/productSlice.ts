import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@interfaces/product/product";
import { ProductList } from "@lib/productService";

export const fetchProductAsync = createAsyncThunk("product/list", async () => {
  const response = await ProductList();
  return response;
});

interface ProductState {
  products: Product[];
  search: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  search: "",
  isLoading: false,
  error: null,
};

const contentSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
      })
      .addCase(fetchProductAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch products";
      });
  },
});

export const { setSearch, setIsLoading, setError, setProducts } =
  contentSlice.actions;
export default contentSlice.reducer;
