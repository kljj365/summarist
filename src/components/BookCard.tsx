"use client";

import Link from "next/link";
import { AiOutlineClockCircle, AiOutlineStar } from "react-icons/ai";
import { formatTime, useAudioDuration } from "@/lib/audio";
import { useIsPremium } from "@/store/hooks";
import Skeleton from "./Skeleton";

interface CardBook {
  id: string;
  title: string;
  author: string;
  subTitle: string;
  imageLink: string;
  audioLink: string;
  averageRating: number;
  subscriptionRequired: boolean;
}

export default function BookCard({ book }: { book: CardBook }) {
  const isPremium = useIsPremium();
  const duration = useAudioDuration(book.audioLink);
  return (
    <Link href={`/book/${book.id}`} className="for-you__recommended--books-link">
      {book.subscriptionRequired && !isPremium && <div className="book__pill">Premium</div>}
      <figure className="book__image--wrapper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="book__image" src={book.imageLink} alt={book.title} loading="lazy" />
      </figure>
      <div className="recommended__book--title">{book.title}</div>
      <div className="recommended__book--author">{book.author}</div>
      <div className="recommended__book--sub-title">{book.subTitle}</div>
      <div className="recommended__book--details-wrapper">
        <div className="recommended__book--details">
          <div className="recommended__book--details-icon">
            <AiOutlineClockCircle />
          </div>
          <div className="recommended__book--details-text">{duration === null ? "--:--" : formatTime(duration)}</div>
        </div>
        <div className="recommended__book--details">
          <div className="recommended__book--details-icon">
            <AiOutlineStar />
          </div>
          <div className="recommended__book--details-text">{book.averageRating}</div>
        </div>
      </div>
    </Link>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="for-you__recommended--books-link">
      <Skeleton height={172} radius={4} className="book__image--skeleton" />
      <Skeleton height={20} width="90%" />
      <Skeleton height={16} width="60%" />
      <Skeleton height={32} width="100%" />
      <Skeleton height={16} width="50%" />
    </div>
  );
}

export function BookRow({ books, loading }: { books?: CardBook[]; loading: boolean }) {
  return (
    <div className="for-you__recommended--books">
      {loading
        ? Array.from({ length: 5 }, (_, i) => <BookCardSkeleton key={i} />)
        : books?.map((book) => <BookCard key={book.id} book={book} />)}
    </div>
  );
}
