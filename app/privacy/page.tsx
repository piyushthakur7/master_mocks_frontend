import Navbar from "@/compnents/Navbar";
import Footer from "@/compnents/Footer";

export const metadata = {
  title: "Privacy Policy | Master Mocks",
  description:
    "How Master Mocks collects, uses, stores, and protects your information when you use the Platform.",
};

const SUPPORT_EMAIL = "support@mastermocks.com";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased flex flex-col">
      <Navbar />
      <main className="flex-grow py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12 border-b border-slate-200 pb-8">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Privacy Policy</h1>
            <p className="text-sm text-slate-500">Last Updated: 30th July 2026</p>
          </header>

          <div className="space-y-10 text-slate-700 leading-relaxed">
            <section className="space-y-4">
              <p>
                Master Mocks (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) operates the website{" "}
                <span className="font-semibold text-slate-900">mastermocks.in</span> (the
                &quot;Platform&quot;), providing mock tests, PDFs, and performance-based cashback
                rewards for Banking &amp; Insurance exam aspirants. This Privacy Policy explains how
                we collect, use, store, and protect your information when you use our Platform.
              </p>
              <p className="font-semibold text-slate-900">
                By using Master Mocks, you agree to the practices described in this policy.
              </p>
            </section>

            <Section n={1} title="Information We Collect">
              <SubHeading>a) Information you provide directly</SubHeading>
              <List
                items={[
                  "Name, email address, and mobile number (at registration)",
                  "Password (stored in encrypted form)",
                  "Payment details for paid mocks (processed securely via our payment gateway partner — we do not store your card/UPI details on our servers)",
                  "Bank account / UPI ID, if required to process cashback reward payouts",
                  "Any information you submit via contact forms, support emails, or feedback",
                ]}
              />

              <SubHeading>b) Information collected automatically</SubHeading>
              <List
                items={[
                  "Device and browser information (IP address, browser type, operating system)",
                  "Usage data (pages visited, mocks attempted, time spent, click patterns)",
                  "Cookies and similar tracking technologies (see Section 6)",
                ]}
              />

              <SubHeading>c) Performance data</SubHeading>
              <List
                items={[
                  "Your responses, scores, accuracy, time taken, and rank in free and paid mock tests, used to determine cashback eligibility and to show you performance analytics.",
                ]}
              />
            </Section>

            <Section n={2} title="How We Use Your Information">
              <p>We use the information collected to:</p>
              <List
                items={[
                  "Create and manage your account",
                  "Provide access to free/paid mocks and PDFs",
                  "Process payments for paid mocks",
                  "Calculate rankings and disburse cashback rewards to eligible top performers",
                  "Send important updates (mock schedules, results, reward status) via email/SMS/WhatsApp",
                  "Improve our platform, questions, and user experience through analytics",
                  "Respond to your queries and support requests",
                  "Detect and prevent fraud, cheating, or misuse of the reward system (e.g., multiple accounts, screen-sharing during the test window)",
                  "Comply with applicable legal and regulatory requirements",
                ]}
              />
            </Section>

            <Section n={3} title="Sharing of Information">
              <p>
                We do not sell your personal information to third parties. We may share your data
                with:
              </p>
              <List
                items={[
                  "Payment gateway providers (e.g., Razorpay/Cashfree/similar), solely to process payments and cashback payouts",
                  "Service providers who help us operate the Platform (hosting, analytics, SMS/email/WhatsApp notification services), under confidentiality obligations",
                  "Legal authorities, if required by law, court order, or government request",
                  "In connection with a business transfer (merger, acquisition, or sale of assets), where user data may be transferred as part of that transaction",
                ]}
              />
            </Section>

            <Section n={4} title="Cashback Reward Payouts">
              <p>
                To process cashback rewards, we may require your bank account details, UPI ID, or
                details of any payment app used for payout. This information is used solely for
                reward disbursement and is not used for any other purpose. Please ensure the details
                you provide are accurate — we are not responsible for payouts sent to incorrect
                information supplied by you.
              </p>
            </Section>

            <Section n={5} title="Data Security">
              <p>
                We use reasonable technical and organizational measures (encryption, secure servers,
                access controls) to protect your data. However, no method of transmission over the
                internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </Section>

            <Section n={6} title="Cookies">
              <p>We use cookies and similar technologies to:</p>
              <List
                items={[
                  "Keep you logged in",
                  "Remember your preferences",
                  "Understand usage patterns to improve the Platform",
                  "Enable analytics (e.g., Google Analytics)",
                ]}
              />
              <p>
                You can disable cookies through your browser settings, though some features of the
                Platform may not function properly without them.
              </p>
            </Section>

            <Section n={7} title="Data Retention">
              <p>
                We retain your personal information for as long as your account is active, or as
                needed to provide services, comply with legal obligations, resolve disputes, and
                enforce our agreements. You may request deletion of your account and associated data
                (see Section 8).
              </p>
            </Section>

            <Section n={8} title="Your Rights">
              <p>You have the right to:</p>
              <List
                items={[
                  "Access the personal information we hold about you",
                  "Request correction of inaccurate or incomplete data",
                  "Request deletion of your account and personal data (subject to legal/financial record-keeping requirements, e.g., transaction records)",
                  "Withdraw consent for marketing communications at any time",
                ]}
              />
              <p>
                To exercise these rights, contact us at{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-brand font-semibold hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </Section>

            <Section n={9} title="Children's Privacy">
              <p>
                Master Mocks is intended for users preparing for competitive exams and is not
                directed at children under 13. We do not knowingly collect personal information from
                children under 13.
              </p>
            </Section>

            <Section n={10} title="Third-Party Links">
              <p>
                Our Platform may contain links to third-party websites (e.g., YouTube, Telegram,
                Instagram). We are not responsible for the privacy practices or content of these
                external sites.
              </p>
            </Section>

            <Section n={11} title="Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. Material changes will be
                communicated via email or a notice on the Platform. Continued use of Master Mocks
                after changes constitutes acceptance of the revised policy.
              </p>
            </Section>

            <Section n={12} title="Contact Us">
              <p>
                For any privacy-related questions or concerns, please contact us at{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-brand font-semibold hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                or call us at{" "}
                <a href="tel:+919769292109" className="text-brand font-semibold hover:underline">
                  +91 97692 92109
                </a>
                .
              </p>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold text-slate-900">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold text-slate-900 pt-2">{children}</h3>;
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-6 space-y-2 marker:text-brand">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
