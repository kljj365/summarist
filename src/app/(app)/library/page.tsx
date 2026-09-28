"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { watchLibrary } from "@/lib/userData";
import type { LibraryEntry } from "@/lib/types";
import BookCard, { BookCardSkeleton } from "@/components/BookCard";
import LoginPrompt from "@/components/LoginPrompt";
import Skeleton from "@/components/Skeleton";

function Section({
  title,
  books,
  emptyTitle,
  emptyText,
}: {
  title: string;
  books: LibraryEntry[];
  emptyTitle: string;
  emptyText: string;
}) {
  return (
    <>
      <div className="for-you__title">{title}</div>
      <div className="for-you__sub--title">
        {books.length} {books.length === 1 ? "item" : "items"}
      </div>
      {books.length === 0 ? (
        <div className="finished__books--block-wrapper">
          <div className="finished__books--title">{emptyTitle}</div>
          <div className="finished__books--sub-title">{emptyText}</div>
        </div>
      ) : (
        <div className="for-you__recommended--books library__books">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </>
  );
}

export default function LibraryPage() {
  const { status, uid } = useAppSelector((s) => s.user);
  const [library, setLibrary] = useState<{ uid: string; entries: LibraryEntry[] } | null>(null);

  // Firestore pushes every change, so saving or finishing a book updates this page live.
  useEffect(() => {
    if (status !== "authenticated" || !uid) return;
    return watchLibrary(uid, (entries) => setLibrary({ uid, entries }));
  }, [status, uid]);
  const entries = status === "authenticated" && library?.uid === uid ? library.entries : null;

  if (status === "signedOut") {
    return (
      <div className="row">
        <div className="container">
          <LoginPrompt message="Log in to your account to see your library." />
        </div>
      </div>
    );
  }

  const loading = status === "loading" || entries === null;

  return (
    <div className="row">
      <div className="container">
        <div className="for-you__wrapper">
          {loading ? (
            <>
              <Skeleton height={32} width={200} />
              <Skeleton height={20} width={80} />
              <div className="for-you__recommended--books">
                {Array.from({ length: 4 }, (_, i) => (
                  <BookCardSkeleton key={i} />
                ))}
              </div>
            </>
          ) : (
            <>
              <Section
                title="Saved Books"
                books={entries.filter((e) => e.saved)}
                emptyTitle="Save your favorite books!"
                emptyText="When you save a book, it will appear here."
              />
              <Section
                title="Finished"
                books={entries.filter((e) => e.finished)}
                emptyTitle="Done and dusted!"
                emptyText="When you finish a book, you can find it here."
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
