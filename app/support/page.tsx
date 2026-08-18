import Link from "next/link";

export const metadata = {
  title: "Support — Hardcopy",
};

export default function SupportPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 bg-canvas px-5 py-10 text-sm leading-relaxed text-neutral-300">
      <div>
        <Link href="/" className="text-xs text-accent">
          &larr; Back
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-white">Support</h1>
      </div>

      <p>
        Running into a bug, or something not working the way it should? Email{" "}
        <a href="mailto:founder@hardcopy.cloud" className="text-accent">
          founder@hardcopy.cloud
        </a>{" "}
        and describe what happened — screenshots help. This inbox is for real
        app issues; general feedback and feature requests are welcome too, but
        please keep it to Hardcopy-related topics.
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-white">Common questions</h2>
        <ul className="list-disc pl-5">
          <li>
            <span className="text-white">Forgot your password?</span> Use the
            &quot;Forgot password&quot; link on the sign-in screen to reset it
            by email.
          </li>
          <li>
            <span className="text-white">Want to delete your account?</span>{" "}
            Go to Profile → Delete my account. This is immediate and
            irreversible.
          </li>
          <li>
            <span className="text-white">Barcode won&apos;t scan?</span> Make
            sure Hardcopy has camera permission (Settings → Hardcopy →
            Camera), and try searching by title instead — every barcode
            lookup can also be done manually.
          </li>
        </ul>
      </section>

      <p className="text-xs text-muted">
        See also the{" "}
        <Link href="/privacy" className="text-accent">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="text-accent">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
