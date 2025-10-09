"use client";

import Link from "next/link";

export default function FloatingContacts() {
  return (
    <div className="fixed right-5 bottom-5 z-50 flex flex-col gap-3">
      {/* Telegram */}
      <Link
        href="#"
        aria-label="Написать в Telegram"
        title="Написать в Telegram"
        target="_blank"
        className="rounded-full bg-sky-500 p-3 text-white shadow-lg transition hover:bg-sky-600"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M9.03 15.47 8.9 19a1 1 0 0 0 1.72.69l2.08-2.12 3.88 2.84a1 1 0 0 0 1.57-.63L21.96 4.1a1 1 0 0 0-1.37-1.1L2.64 10.29a1 1 0 0 0 .1 1.85l4.89 1.8 10.83-8.3-9.43 9.83Z" />
        </svg>
      </Link>
      {/* WhatsApp */}
      <Link
        href="#"
        aria-label="Написать в WhatsApp"
        title="Написать в WhatsApp"
        target="_blank"
        className="rounded-full bg-emerald-500 p-3 text-white shadow-lg transition hover:bg-emerald-600"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M20.52 3.48A11.94 11.94 0 0 0 12 .5C5.65.5.5 5.65.5 12c0 2 .52 3.9 1.5 5.6L.5 23.5l6.1-1.56A11.45 11.45 0 0 0 12 23.5c6.35 0 11.5-5.15 11.5-11.5 0-3.07-1.2-5.96-3.48-8.02ZM12 21a9.4 9.4 0 0 1-4.78-1.29l-.34-.2-3.62.92.97-3.53-.22-.36A9.45 9.45 0 1 1 12 21Zm5.38-6.61c-.29-.14-1.7-.84-1.96-.93-.26-.1-.45-.14-.64.14-.19.29-.74.93-.9 1.12-.17.19-.33.22-.61.08-.29-.14-1.23-.45-2.35-1.45-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.45.13-.59.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.47-.64-.47-.16 0-.36-.02-.55-.02-.19 0-.5.07-.77.36-.26.29-1 1-1 2.43 0 1.43 1.03 2.82 1.18 3.01.14.19 2.02 3.07 4.89 4.31.68.29 1.21.47 1.62.6.68.22 1.3.19 1.8.12.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.33Z" />
        </svg>
      </Link>
    </div>
  );
}
