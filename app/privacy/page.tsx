import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Hardcopy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 bg-canvas px-5 py-10 text-sm leading-relaxed text-neutral-300">
      <div>
        <Link href="/" className="text-xs text-accent">
          &larr; Back
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-white">Privacy Policy</h1>
        <p className="mt-1 text-xs text-muted">Last updated: August 11, 2026</p>
      </div>

      <p>
        This policy explains what data Hardcopy collects, why, and how you can
        remove it. Hardcopy does not sell your data or show ads, and does not
        share your data with anyone except the service providers listed below
        that make the app work.
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">What we collect</h2>
        <ul className="list-disc pl-5">
          <li>
            <span className="text-white">Account info:</span> the email address
            and password you sign up with (handled by Firebase Authentication —
            we never see or store your raw password).
          </li>
          <li>
            <span className="text-white">Your collection data:</span> the
            movies, formats, and shelf locations you add, your wishlist, your
            custom lists, and any ratings you enter. This is data you choose to
            enter — it exists to power the app&apos;s own features.
          </li>
          <li>
            <span className="text-white">Barcode scans:</span> if you use the
            camera to scan a UPC barcode, the scan happens on your device. Only
            the decoded barcode number is sent to our server to look up a
            matching product title — no photo or video is ever captured,
            stored, or transmitted.
          </li>
          <li>
            <span className="text-white">Basic technical data:</span> our
            hosting provider (Vercel) and database provider (Firebase)
            automatically log standard infrastructure data (like IP address and
            request timestamps) for security and reliability, as is standard
            for any web service.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">Camera, microphone &amp; location</h2>
        <p>
          Hardcopy only ever requests access to your <span className="text-white">camera</span>,
          and only to scan barcodes when you tap the scan button — you&apos;ll see
          an explanation on-screen before your device&apos;s permission prompt
          appears, and you can decline and still use manual search instead.
          Hardcopy does not request microphone or location access at all.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">Who we share data with</h2>
        <p>
          We use a small set of third-party services to run the app, and your
          data passes through them only as needed to provide the service:
        </p>
        <ul className="list-disc pl-5">
          <li>
            <span className="text-white">Firebase</span> (Google) — account
            login and database storage.
          </li>
          <li>
            <span className="text-white">Vercel</span> — hosting.
          </li>
          <li>
            <span className="text-white">TMDB</span> — movie search and poster
            artwork (search queries are sent, not personal account info).
          </li>
          <li>
            <span className="text-white">UPCitemdb</span> — barcode-to-product
            lookups (a scanned barcode number is sent, not personal account
            info).
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">Your choices</h2>
        <p>
          You can edit or delete any movie, wishlist item, or list at any time
          from within the app. You can permanently delete your account and all
          associated data from the Profile tab — this immediately and
          irreversibly removes your account info and everything you&apos;ve
          added.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">Children</h2>
        <p>Hardcopy is not directed at children under 13, and we don&apos;t knowingly collect data from them.</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">Changes</h2>
        <p>
          If this policy changes, the &quot;last updated&quot; date above will
          change. Material changes will be reflected here before they take
          effect.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">Contact</h2>
        <p>
          Questions about this policy can be sent to the app developer via the
          contact listed on the app&apos;s store listing.
        </p>
      </section>
    </div>
  );
}
