"use client";

import Link from "next/link";
import { BsFillPlayFill } from "react-icons/bs";
import { useGetBooksQuery } from "@/store/booksApi";
import { formatLong, useAudioDuration } from "@/lib/audio";
import { BookRow } from "@/components/BookCard";
import Skeleton from "@/components/Skeleton";
import type { Book } from "@/lib/types";

function SelectedBook({ book }: { book: Book }) {
  const duration = useAudioDuration(book.audioLink);
  return (
    <Link href={`/book/${book.id}`} className="selected__book">
      <div className="selected__book--sub-title">{book.subTitle}</div>
      <div className="selected__book--line" />
      <div className="selected__book--content">
        <figure className="book__image--wrapper selected__book--image-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="book__image" src={book.imageLink} alt={book.title} />
        </figure>
        <div className="selected__book--text">
          <div className="selected__book--title">{book.title}</div>
          <div className="selected__book--author">{book.author}</div>
          <div className="selected__book--duration-wrapper">
            <div className="selected__book--icon">
              <BsFillPlayFill />
            </div>
            <div className="selected__book--duration">{duration === null ? "Loading…" : formatLong(duration)}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ForYouPage() {
  const selected = useGetBooksQuery("selected");
  const recommended = useGetBooksQuery("recommended");
  const suggested = useGetBooksQuery("suggested");

  return (
    <div className="row">
      <div className="container">
        <div className="for-you__wrapper">
          <div className="for-you__title">Selected just for you</div>
          {selected.isLoading || !selected.data ? (
            <Skeleton height={200} width="" className="selected__book--skeleton" />
          ) : (
            selected.data[0] && <SelectedBook book={selected.data[0]} />
          )}

          <div>
            <div className="for-you__title">Recommended For You</div>
            <div className="for-you__sub--title">We think you’ll like these</div>
            <BookRow books={recommended.data} loading={recommended.isLoading} />
          </div>

          <div>
            <div className="for-you__title">Suggested Books</div>
            <div className="for-you__sub--title">Browse those books</div>
            <BookRow books={suggested.data} loading={suggested.isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
