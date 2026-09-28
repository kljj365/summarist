"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AiOutlineStar, AiOutlineClockCircle } from "react-icons/ai";
import { HiOutlineMicrophone, HiOutlineLightBulb } from "react-icons/hi";
import { VscBook } from "react-icons/vsc";
import { BsBookmark, BsFillBookmarkFill } from "react-icons/bs";
import { useGetBookQuery } from "@/store/booksApi";
import { useAppDispatch, useAppSelector, useIsPremium } from "@/store/hooks";
import { openModal } from "@/store/modalSlice";
import { formatTime, useAudioDuration } from "@/lib/audio";
import { setSaved, watchEntry } from "@/lib/userData";
import Skeleton from "@/components/Skeleton";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, uid, planReady } = useAppSelector((s) => s.user);
  const isPremium = useIsPremium();
  const { data: book, isLoading, isError } = useGetBookQuery(id);
  const duration = useAudioDuration(book?.audioLink);
  const [entry, setEntry] = useState<{ key: string; saved: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  // Live-listen to this book's library entry while signed in. The flag is tagged with the
  // user/book it belongs to, so a stale value never shows after logout or a route change.
  const watchKey = status === "authenticated" && uid && id ? `${uid}/${id}` : null;
  useEffect(() => {
    if (!watchKey || !uid) return;
    return watchEntry(uid, id, (e) => setEntry({ key: watchKey, saved: Boolean(e?.saved) }));
  }, [watchKey, uid, id]);
  const saved = Boolean(watchKey && entry?.key === watchKey && entry.saved);

  // Read/Listen gate: signed out opens the login modal, premium books need a subscription,
  // everyone else goes straight to the player.
  function openPlayer() {
    if (!book) return;
    if (status !== "authenticated") {
      dispatch(openModal("login"));
      return;
    }
    if (!planReady) return;
    if (book.subscriptionRequired && !isPremium) {
      router.push("/choose-plan");
      return;
    }
    router.push(`/player/${book.id}`);
  }

  async function toggleLibrary() {
    if (!book) return;
    if (status !== "authenticated" || !uid) {
      dispatch(openModal("login"));
      return;
    }
    setSaving(true);
    try {
      await setSaved(uid, book, !saved);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="row">
        <div className="container">
          <div className="inner__wrapper">
            <div className="inner__book">
              <Skeleton height={40} width="70%" />
              <Skeleton height={20} width="30%" />
              <Skeleton height={24} width="90%" />
              <Skeleton height={80} width="100%" />
              <Skeleton height={48} width="40%" />
              <Skeleton height={200} width="100%" />
            </div>
            <div className="inner-book--img-wrapper">
              <Skeleton height={300} width={300} radius={0} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="row">
        <div className="container">
          <div className="inner__book--title">Book not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="container">
        <div className="inner__wrapper">
          <div className="inner__book">
            <div className="inner-book__title">
              {book.title}
              {book.subscriptionRequired && !isPremium ? " (Premium)" : ""}
            </div>
            <div className="inner-book__author">{book.author}</div>
            <div className="inner-book__sub--title">{book.subTitle}</div>
            <div className="inner-book__wrapper">
              <div className="inner-book__description--wrapper">
                <div className="inner-book__description">
                  <div className="inner-book__icon">
                    <AiOutlineStar />
                  </div>
                  <div className="inner-book__overall--rating">{book.averageRating}&nbsp;</div>
                  <div className="inner-book__total--rating">({book.totalRating}&nbsp;ratings)</div>
                </div>
                <div className="inner-book__description">
                  <div className="inner-book__icon">
                    <AiOutlineClockCircle />
                  </div>
                  <div className="inner-book__duration">{duration === null ? "--:--" : formatTime(duration)}</div>
                </div>
                <div className="inner-book__description">
                  <div className="inner-book__icon">
                    <HiOutlineMicrophone />
                  </div>
                  <div className="inner-book__type">{book.type}</div>
                </div>
                <div className="inner-book__description">
                  <div className="inner-book__icon">
                    <HiOutlineLightBulb />
                  </div>
                  <div className="inner-book__key--ideas">{book.keyIdeas} Key ideas</div>
                </div>
              </div>
            </div>
            <div className="inner-book__read--btn-wrapper">
              <button className="inner-book__read--btn" onClick={openPlayer}>
                <div className="inner-book__read--icon">
                  <VscBook />
                </div>
                <div className="inner-book__read--text">Read</div>
              </button>
              <button className="inner-book__read--btn" onClick={openPlayer}>
                <div className="inner-book__read--icon">
                  <HiOutlineMicrophone />
                </div>
                <div className="inner-book__read--text">Listen</div>
              </button>
            </div>
            <button className="inner-book__bookmark" onClick={toggleLibrary} disabled={saving}>
              <div className="inner-book__bookmark--icon">{saved ? <BsFillBookmarkFill /> : <BsBookmark />}</div>
              <div className="inner-book__bookmark--text">
                {saved ? "Saved in My Library" : "Add title to My Library"}
              </div>
            </button>
            <div className="inner-book__secondary--title">What&apos;s it about?</div>
            <div className="inner-book__tags--wrapper">
              {book.tags?.map((tag) => (
                <div className="inner-book__tag" key={tag}>
                  {tag}
                </div>
              ))}
            </div>
            <div className="inner-book__book--description">{book.bookDescription}</div>
            <h2 className="inner-book__secondary--title">About the author</h2>
            <div className="inner-book__author--description">{book.authorDescription}</div>
          </div>
          <div className="inner-book--img-wrapper">
            <figure className="book__image--wrapper inner-book__image--wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="book__image" src={book.imageLink} alt={book.title} />
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
}
