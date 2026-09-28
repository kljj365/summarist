"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetBookQuery } from "@/store/booksApi";
import { useAppSelector, useIsPremium } from "@/store/hooks";
import { markFinished } from "@/lib/userData";
import AudioPlayer from "@/components/AudioPlayer";
import LoginPrompt from "@/components/LoginPrompt";
import Skeleton from "@/components/Skeleton";

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { status, uid } = useAppSelector((s) => s.user);
  const fontSize = useAppSelector((s) => s.ui.fontSize);
  const isPremium = useIsPremium();
  const planKnown = useAppSelector((s) => s.user.planReady);
  const { data: book, isLoading } = useGetBookQuery(id);

  // The paywall is checked again here, so typing a premium book's player URL can't skip it.
  const locked = Boolean(book?.subscriptionRequired && status === "authenticated" && !isPremium);
  useEffect(() => {
    if (planKnown && locked) router.replace("/choose-plan");
  }, [planKnown, locked, router]);

  const signedOut = status === "signedOut";
  const ready = !isLoading && status === "authenticated" && planKnown && book && !locked;

  return (
    <>
      <div className="summary">
        <div className="audio__book--summary" style={{ fontSize }}>
          {isLoading || status === "loading" ? (
            <>
              <Skeleton height={32} width="60%" />
              <div className="audio__book--spacer" />
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} height={16} width={i % 3 === 2 ? "70%" : "100%"} className="summary__skeleton-line" />
              ))}
            </>
          ) : (
            <>
              <div className="audio__book--summary-title">
                <b>{book?.title ?? "Book not found"}</b>
              </div>
              {signedOut ? (
                <LoginPrompt message="Log in to your account to read and listen to the book" />
              ) : ready ? (
                <div className="audio__book--summary-text">{book.summary}</div>
              ) : null}
            </>
          )}
        </div>
      </div>
      <AudioPlayer
        key={id}
        title={book?.title ?? ""}
        author={book?.author ?? ""}
        imageLink={book?.imageLink}
        audioLink={book?.audioLink}
        disabled={!ready}
        onFinished={() => {
          if (uid && book) markFinished(uid, book).catch(() => {});
        }}
      />
    </>
  );
}
