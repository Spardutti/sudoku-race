export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 font-serif">Privacy Policy</h1>
      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-sm text-gray-600">Last updated: December 6, 2025</p>

        <section>
          <h2 className="text-2xl font-bold mb-3 font-serif">Introduction</h2>
          <p>
            Welcome to Sudoku Race (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed to protecting your
            privacy and being transparent about how we collect, use, and share your data. This Privacy
            Policy explains how we handle your information when you use our daily Sudoku puzzle game.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 font-serif">Information We Collect</h2>

          <h3 className="text-xl font-semibold mb-2 font-serif">1. Information from Google OAuth</h3>
          <p>When you sign in with Google, we collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your email address</li>
            <li>Your name (used to generate your username)</li>
            <li>Your Google profile picture (optional)</li>
          </ul>
          <p className="mt-2">
            We use Google OAuth for authentication only. We do not store your Google password or
            access any other Google services on your behalf.
          </p>

          <h3 className="text-xl font-semibold mb-2 mt-4 font-serif">2. Game Activity Data</h3>
          <p>When you play Sudoku Race, we automatically collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Puzzle completion times</li>
            <li>Your solve attempts and paths</li>
            <li>Leaderboard rankings</li>
            <li>Streak statistics</li>
            <li>Dates and times of gameplay sessions</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4 font-serif">3. Technical Information</h3>
          <p>We automatically collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Browser type and version</li>
            <li>Device type (mobile, tablet, desktop)</li>
            <li>IP address (for security and fraud prevention)</li>
            <li>Usage analytics (page views, feature interactions)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 font-serif">How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide and maintain the game service</li>
            <li>Authenticate your account and maintain your session</li>
            <li>Track your puzzle completion times and rankings</li>
            <li>Display leaderboards and competitive rankings</li>
            <li>Calculate and display your streaks and statistics</li>
            <li>Improve game performance and user experience</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Send important service updates (if you opt-in to notifications)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 font-serif">How We Share Your Information</h2>

          <h3 className="text-xl font-semibold mb-2 font-serif">Public Information</h3>
          <p>The following information is publicly visible to all users:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your username</li>
            <li>Your leaderboard rankings</li>
            <li>Your puzzle completion times</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4 font-serif">Third-Party Services</h3>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Supabase</strong> - Database and authentication infrastructure (stores user
              data, game statistics)
            </li>
            <li>
              <strong>Vercel</strong> - Hosting and deployment platform
            </li>
            <li>
              <strong>Sentry</strong> - Error tracking and monitoring (no personal data shared)
            </li>
            <li>
              <strong>Vercel Analytics</strong> - Usage analytics (anonymized)
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4 font-serif">What We Don&apos;t Do</h3>
          <p className="font-semibold">We DO NOT:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Sell your data to third parties</li>
            <li>Use your data for advertising</li>
            <li>Share your email address publicly</li>
            <li>Access any Google services beyond basic authentication</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 font-serif">Data Storage and Security</h2>
          <p>
            Your data is stored securely using industry-standard encryption. We use Supabase&apos;s
            infrastructure, which employs:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>HTTPS encryption for all data in transit</li>
            <li>Database encryption at rest</li>
            <li>Row-level security policies</li>
            <li>Regular security audits and updates</li>
          </ul>
          <p className="mt-2">
            While we take reasonable measures to protect your data, no method of transmission over
            the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 font-serif">Data Retention</h2>
          <p>We retain your data as follows:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Account data:</strong> Retained until you delete your account
            </li>
            <li>
              <strong>Game statistics:</strong> Retained indefinitely for leaderboard integrity
            </li>
            <li>
              <strong>Analytics data:</strong> Aggregated and anonymized after 90 days
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 font-serif">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Export your game statistics</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, please contact us at{" "}
            <a href="mailto:luisdamian.sp@gmail.com" className="text-blue-600 hover:underline">
              luisdamian.sp@gmail.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 font-serif">Children&apos;s Privacy</h2>
          <p>
            Sudoku Race is not directed to children under 13 years of age. We do not knowingly
            collect personal information from children under 13. If you believe we have collected
            information from a child under 13, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 font-serif">Cookies and Local Storage</h2>
          <p>We use cookies and browser local storage to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Maintain your authentication session</li>
            <li>Remember your preferences</li>
            <li>Track guest gameplay (before authentication)</li>
          </ul>
          <p className="mt-2">
            You can disable cookies in your browser settings, but this may limit functionality.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 font-serif">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes by posting a notice on our website or sending an email to registered users. Your
            continued use of Sudoku Race after changes become effective constitutes acceptance of the
            updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 font-serif">Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us:</p>
          <p className="mt-2">
            Email:{" "}
            <a href="mailto:luisdamian.sp@gmail.com" className="text-blue-600 hover:underline">
              luisdamian.sp@gmail.com
            </a>
          </p>
          <p>Website: https://sudoku-race.vercel.app</p>
        </section>

        <section className="border-t pt-6 mt-8">
          <h2 className="text-2xl font-bold mb-3 font-serif">
            Google API Services User Data Policy Compliance
          </h2>
          <p>
            Sudoku Race&apos;s use of information received from Google APIs adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </section>
      </div>
    </main>
  );
}
