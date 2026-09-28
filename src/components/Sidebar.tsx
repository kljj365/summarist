"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import { AiOutlineHome, AiOutlineSearch, AiOutlineSetting, AiOutlineQuestionCircle } from "react-icons/ai";
import { BsBookmark } from "react-icons/bs";
import { RiBallPenLine } from "react-icons/ri";
import { FiLogOut } from "react-icons/fi";
import { RxLetterCaseCapitalize } from "react-icons/rx";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openModal } from "@/store/modalSlice";
import { closeSidebar, FONT_SIZES, setFontSize } from "@/store/uiSlice";
import { logout } from "@/lib/auth";

const ICON_SIZES = ["small", "medium", "large", "xlarge"] as const;

function Item({
  icon: Icon,
  label,
  href,
  active = false,
  disabled = false,
  onClick,
}: {
  icon: IconType;
  label: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <div className={`sidebar__link--line ${active ? "active--tab" : ""}`} />
      <div className="sidebar__icon--wrapper">
        <Icon />
      </div>
      <div className="sidebar__link--text">{label}</div>
    </>
  );
  const className = `sidebar__link--wrapper ${disabled ? "sidebar__link--not-allowed" : ""}`;
  if (href && !disabled) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={disabled ? undefined : onClick} aria-disabled={disabled}>
      {inner}
    </button>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((s) => s.user);
  const { fontSize, sidebarOpen } = useAppSelector((s) => s.ui);
  const onPlayer = pathname.startsWith("/player");
  const close = () => dispatch(closeSidebar());

  return (
    <>
      <div className={`sidebar__overlay ${sidebarOpen ? "" : "sidebar__overlay--hidden"}`} onClick={close} />
      <div className={`sidebar ${sidebarOpen ? "sidebar--opened" : ""} ${onPlayer ? "sidebar--player" : ""}`}>
        <div className="sidebar__logo">
          <Link href="/for-you" onClick={close}>
            <Image src="/assets/logo.png" alt="Summarist" width={495} height={114} priority />
          </Link>
        </div>
        <div className="sidebar__wrapper">
          <div className="sidebar__top">
            <Item icon={AiOutlineHome} label="For you" href="/for-you" active={pathname === "/for-you"} onClick={close} />
            <Item icon={BsBookmark} label="My Library" href="/library" active={pathname === "/library"} onClick={close} />
            <Item icon={RiBallPenLine} label="Highlights" disabled />
            <Item icon={AiOutlineSearch} label="Search" disabled />
            {onPlayer && (
              <div className="sidebar__link--wrapper sidebar__font--size-wrapper">
                {FONT_SIZES.map((size, index) => (
                  <button
                    key={size}
                    type="button"
                    aria-label={`Text size ${size}px`}
                    className={`sidebar__font--size-icon ${fontSize === size ? "sidebar__font--size-icon--active" : ""}`}
                    onClick={() => dispatch(setFontSize(size))}
                  >
                    <RxLetterCaseCapitalize className={`sidebar__font--size-icon-${ICON_SIZES[index]}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="sidebar__bottom">
            <Item icon={AiOutlineSetting} label="Settings" href="/settings" active={pathname === "/settings"} onClick={close} />
            <Item icon={AiOutlineQuestionCircle} label="Help & Support" disabled />
            {status === "authenticated" ? (
              <Item
                icon={FiLogOut}
                label="Logout"
                onClick={() => {
                  close();
                  logout();
                }}
              />
            ) : (
              <Item
                icon={FiLogOut}
                label="Login"
                onClick={() => {
                  close();
                  dispatch(openModal("login"));
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
