import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Book } from "@/lib/types";

type Status = "selected" | "recommended" | "suggested";

// All book data comes from the Summarist API. `selected` is documented as a single object but
// the live endpoint returns an array of one, so both shapes are normalised to an array.
export const booksApi = createApi({
  reducerPath: "booksApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://us-central1-summaristt.cloudfunctions.net/" }),
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getBooks: builder.query<Book[], Status>({
      query: (status) => `getBooks?status=${status}`,
      transformResponse: (response: Book | Book[]) => (Array.isArray(response) ? response : [response]),
    }),
    getBook: builder.query<Book | null, string>({
      query: (id) => `getBook?id=${encodeURIComponent(id)}`,
      transformResponse: (response: Book | Record<string, never> | "") =>
        response && typeof response === "object" && "id" in response ? (response as Book) : null,
    }),
    searchBooks: builder.query<Book[], string>({
      query: (search) => `getBooksByAuthorOrTitle?search=${encodeURIComponent(search)}`,
      transformResponse: (response: Book[] | unknown) => (Array.isArray(response) ? response : []),
    }),
  }),
});

export const { useGetBooksQuery, useGetBookQuery, useSearchBooksQuery } = booksApi;
