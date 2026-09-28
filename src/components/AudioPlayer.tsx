"use client";

import { useRef, useState } from "react";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { RiReplay10Line, RiForward10Line } from "react-icons/ri";
import { formatTime } from "@/lib/audio";

interface Props {
  title: string;
  author: string;
  imageLink?: string;
  audioLink?: string;
  disabled?: boolean;
  onFinished?: () => void;
}

export default function AudioPlayer({ title, author, imageLink, audioLink, disabled = false, onFinished }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  function toggle() {
    const audio = audioRef.current;
    if (!audio || disabled) return;
    if (audio.paused) audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      audio.pause();
      setPlaying(false);
    }
  }

  function skip(seconds: number) {
    const audio = audioRef.current;
    if (!audio || disabled) return;
    audio.currentTime = Math.min(Math.max(0, audio.currentTime + seconds), audio.duration || 0);
    setCurrent(audio.currentTime);
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio || disabled) return;
    audio.currentTime = value;
    setCurrent(value);
  }

  const progress = duration ? (current / duration) * 100 : 0;

  return (
    <div className="audio__wrapper">
      {audioLink && !disabled && (
        <audio
          ref={audioRef}
          src={audioLink}
          preload="metadata"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onEnded={() => {
            setPlaying(false);
            onFinished?.();
          }}
        />
      )}
      <div className="audio__track--wrapper">
        <figure className="audio__track--image-mask">
          {imageLink ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageLink} alt={title} className="audio__track--image" />
          ) : (
            <div className="audio__track--image skeleton" />
          )}
        </figure>
        <div className="audio__track--details-wrapper">
          <div className="audio__track--title">{title}</div>
          <div className="audio__track--author">{author}</div>
        </div>
      </div>
      <div className="audio__controls--wrapper">
        <div className="audio__controls">
          <button className="audio__controls--btn" aria-label="Back 10 seconds" onClick={() => skip(-10)}>
            <RiReplay10Line />
          </button>
          <button
            className="audio__controls--btn audio__controls--btn-play"
            aria-label={playing ? "Pause" : "Play"}
            onClick={toggle}
          >
            {playing ? <BsFillPauseFill /> : <BsFillPlayFill className="audio__controls--play-icon" />}
          </button>
          <button className="audio__controls--btn" aria-label="Forward 10 seconds" onClick={() => skip(10)}>
            <RiForward10Line />
          </button>
        </div>
      </div>
      <div className="audio__progress--wrapper">
        <div className="audio__time">{formatTime(current)}</div>
        <input
          type="range"
          className="audio__progress--bar"
          min={0}
          max={duration || 0}
          step={1}
          value={Math.min(current, duration || 0)}
          onChange={(e) => seek(Number(e.target.value))}
          style={{ ["--progress" as string]: `${progress}%` }}
          aria-label="Seek"
          disabled={disabled}
        />
        <div className="audio__time">{formatTime(duration)}</div>
      </div>
    </div>
  );
}
