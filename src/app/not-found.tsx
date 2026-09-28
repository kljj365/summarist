import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="section__title">Page not found</div>
      <Link href="/for-you" className="btn not-found__btn">
        Go to For You
      </Link>
    </div>
  );
}
