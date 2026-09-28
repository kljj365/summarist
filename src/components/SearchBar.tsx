"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlineSearch, AiOutlineClose, AiOutlineClockCircle } from "react-icons/ai";
import { RxHamburgerMenu } from "react-icons/rx";
import { useSearchBooksQuery } from "@/store/booksApi";
import { useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/uiSlice";
import { formatTime, useAudioDuration } from "@/lib/audio";
import type { Book } from "@/lib/types";
import Skeleton from "./Skeleton";

// Debounce keeps the API from being hit on every keystroke.
function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function Result({ book, onPick }: { book: Book; onPick: () => void }) {
  const duration = useAudioDuration(book.audioLink);
  return (
    <Link href={`/book/${book.id}`} className="search__book--link" onClick={onPick}>
      <figure className="search__book--img-mask">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="search__book--img" src={book.imageLink} alt={book.title} />
      </figure>
      <div>
        <div className="search__book--title">{book.title}</div>
        <div className="search__book--author">{book.author}</div>
        <div className="search__book--duration">
          <AiOutlineClockCircle />
          <span>{duration === null ? "--:--" : formatTime(duration)}</span>
        </div>
      </div>
    </Link>
  );
}

export default function SearchBar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query.trim(), 300);
  const { data, isFetching } = useSearchBooksQuery(debounced, { skip: debounced.length === 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Clear the search when the user navigates. React's "store the previous value" pattern
  // avoids an extra render pass from a setState inside useEffect.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setQuery("");
    setOpen(false);
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const waiting = query.trim() !== debounced || isFetching;

  return (
    <div className="search__background">
      <div className="search__wrapper" ref={wrapperRef}>
        <div className="search__content">
          <div className="search">
            <div className="search__input--wrapper">
              <input
                className="search__input"
                placeholder="Search for books"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                aria-label="Search for books"
              />
              <button
                type="button"
                className="search__icon"
                aria-label={query ? "Clear search" : "Search"}
                onClick={() => setQuery("")}
              >
                {query ? <AiOutlineClose /> : <AiOutlineSearch />}
              </button>
            </div>
          </div>
          <button
            type="button"
            className="sidebar__toggle--btn"
            aria-label="Open menu"
            onClick={() => dispatch(toggleSidebar())}
          >
            <RxHamburgerMenu />
          </button>
        </div>
        {open && query.trim() && (
          <div className="search__books--wrapper">
            {waiting ? (
              Array.from({ length: 4 }, (_, i) => <Skeleton key={i} height={120} className="search__skeleton" />)
            ) : data && data.length > 0 ? (
              data.map((book) => <Result key={book.id} book={book} onPick={() => setOpen(false)} />)
            ) : (
              <div className="search__empty">No books found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
