import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Hardcopy",
};

export default function TermsPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 bg-canvas px-5 py-10 text-sm leading-relaxed text-neutral-300">
      <div>
        <Link href="/" className="text-xs text-accent">
          &larr; Back
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-white">Terms of Service</h1>
        <p className="mt-1 text-xs text-muted">Last updated: August 11, 2026</p>
      </div>

      <p>
        Hardcopy is a free, personal media-collection app. By creating an account
        or using the app, you agree to these terms.
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">1. The service</h2>
        <p>
          Hardcopy lets you catalog movies you own, keep a wishlist of movies you
          want, build custom lists, and use a randomizer to help you pick
          something to watch. The app is provided free of charge, as-is, with no
          guarantee of uptime, accuracy, or continued availability.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">2. Your account</h2>
        <p>
          You&apos;re responsible for the accuracy of the information you provide
          and for keeping your login credentials secure. You must be at least 13
          years old to create an account.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">3. Your content</h2>
        <p>
          Any data you enter — your collection, wishlist, lists, and ratings —
          belongs to you. We store it only to provide the app&apos;s features
          back to you. You can delete your account and all associated data at
          any time from the Profile tab.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">4. Third-party data</h2>
        <p>
          Movie titles, artwork, and metadata are provided by{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
            className="text-accent"
          >
            The Movie Database (TMDB)
          </a>
          . This product uses the TMDB API but is not endorsed, certified, or
          otherwise approved by TMDB. Barcode lookups may use third-party
          product databases. We don&apos;t control the accuracy of this
          third-party data.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">5. Acceptable use</h2>
        <p>
          Don&apos;t use Hardcopy to store or transmit unlawful content, attempt
          to disrupt the service, or try to access other users&apos; data.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">6. Disclaimer &amp; liability</h2>
        <p>
          Hardcopy is provided &quot;as is&quot; without warranties of any kind.
          To the fullest extent permitted by law, we are not liable for any
          indirect, incidental, or consequential damages arising from your use
          of the app, including loss of data. Keep your own backups of anything
          important to you.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">7. Changes</h2>
        <p>
          We may update these terms as the app changes. Continued use of the
          app after an update means you accept the revised terms.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">8. Contact</h2>
        <p>
          Questions about these terms can be sent to the app developer via the
          contact listed on the app&apos;s store listing.
        </p>
      </section>
    </div>
  );
}
