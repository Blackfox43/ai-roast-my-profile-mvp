import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";

type PolicyPage = "main" | "privacy" | "terms";

function PrivacyPolicy() {
  return (
    <div className="space-y-6 text-slate-300">
      <div>
        <h3 className="text-lg font-bold text-white mb-3">1. Information We Collect</h3>
        <p className="leading-relaxed">
          When you use AI Roast My Profile, we collect:
        </p>
        <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
          <li>The profile/bio text you submit (after redaction of emails, phone numbers, and links)</li>
          <li>The roast style you select</li>
          <li>The generated AI roast result</li>
          <li>Whether you opted into the public Wall of Shame</li>
          <li>Timestamp of creation and share counts</li>
          <li>Your IP address for rate limiting purposes</li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">2. How We Use Your Data</h3>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>To generate and store your roast</li>
          <li>To display public roasts on the Wall of Shame (only if you opt-in)</li>
          <li>To enable you to delete your own roasts via delete token</li>
          <li>To prevent abuse through IP-based rate limiting</li>
          <li>To improve the service (aggregate, anonymized analytics)</li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">3. Data Redaction</h3>
        <p className="leading-relaxed">
          Before storage and AI processing, we automatically redact:
        </p>
        <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
          <li>Email addresses → [email hidden]</li>
          <li>Phone numbers → [phone hidden]</li>
          <li>URLs/links → [link hidden]</li>
        </ul>
        <p className="mt-3 text-slate-400 text-sm">
          <strong>Important:</strong> You are responsible for not pasting sensitive information you did not intend to redact (e.g., real names of third parties, private details).
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">4. Storage & Retention</h3>
        <p className="leading-relaxed">
          Roasts are stored in our PostgreSQL database. Private roasts are retained indefinitely unless you delete them. Public roasts remain on the Wall of Shame until deleted. We may retain anonymized usage logs for analytics and abuse detection.</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">5. Sharing & Public Access</h3>
        <p className="leading-relaxed">
          Public roasts are visible to anyone who discovers the Wall of Shame or has the direct link. Shareable links are cryptographically random and not guessable. Your delete token is stored locally in your browser only—we never send it to our servers except to verify deletion requests.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">6. Third-Party Services</h3>
        <p className="leading-relaxed">
          We use Google's Gemini API to generate roasts. Redacted roast prompts are sent to Gemini. Your data may be subject to Google's privacy policies. We do not share your delete tokens or identifiable personal data with third parties except as required by law.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">7. Your Rights</h3>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>You can delete your roasts using the delete token saved in your browser</li>
          <li>You can opt-out of public sharing before generating a roast</li>
          <li>Contact us for data export or deletion requests</li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">8. Security</h3>
        <p className="leading-relaxed">
          We implement standard security practices including HTTPS, secure database connections, and input validation. However, no system is 100% secure. Do not submit truly sensitive information.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">9. Changes to This Policy</h3>
        <p className="leading-relaxed">
          We may update this privacy policy. Changes are effective upon posting. Continued use of the service means acceptance of the new terms.
        </p>
      </div>
    </div>
  );
}

function TermsOfService() {
  return (
    <div className="space-y-6 text-slate-300">
      <div>
        <h3 className="text-lg font-bold text-white mb-3">1. Satirical Parody Only</h3>
        <p className="leading-relaxed">
          AI Roast My Profile is designed for entertainment purposes only. The generated roasts are satirical parody and should not be treated as factual analysis, psychological diagnosis, professional advice, or serious judgment of a person's character.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">2. User Responsibilities</h3>
        <p className="leading-relaxed mb-3">You agree not to use this service to:</p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>Harass, bully, or target individuals for harm</li>
          <li>Amplify attacks on protected characteristics (race, religion, disability, etc.)</li>
          <li>Make employment, lending, or legal decisions based on roasts</li>
          <li>Submit content that violates laws (threats, CSAM, defamation)</li>
          <li>Bypass security or spam the API</li>
          <li>Submit third-party data without consent</li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">3. Content You Submit</h3>
        <p className="leading-relaxed">
          You are solely responsible for the profile text you submit. You represent that you have the right to submit it and that it does not infringe on anyone's rights or violate any laws. By submitting, you grant us a license to process, store, and display it (if public).
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">4. Generated Content</h3>
        <p className="leading-relaxed">
          The AI-generated roasts are provided "as-is" and may contain inaccuracies, nonsensical jokes, or offensive content. We are not liable for the AI's output. Treat all roasts as entertainment, not fact.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">5. Acceptable Use</h3>
        <p className="leading-relaxed mb-3">We reserve the right to:</p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>Refuse or remove roasts that violate these terms</li>
          <li>Rate limit or block abusive users</li>
          <li>Suspend access for policy violations</li>
          <li>Delete content without notice if it violates laws or platform guidelines</li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">6. Limitation of Liability</h3>
        <p className="leading-relaxed">
          To the fullest extent permitted by law, we are not liable for damages arising from your use of this service, including lost profits, data loss, or emotional distress. The service is provided "as-is" without warranties.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">7. Indemnification</h3>
        <p className="leading-relaxed">
          You agree to indemnify and hold us harmless from any claims, damages, or costs arising from your use of the service or violation of these terms.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">8. Termination</h3>
        <p className="leading-relaxed">
          We may suspend or terminate your access at any time for policy violations or abuse. Upon termination, your roasts may be deleted.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">9. Governing Law</h3>
        <p className="leading-relaxed">
          These terms are governed by the laws of State of California. Any disputes shall be resolved in the courts of State of California.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">10. Contact</h3>
        <p className="leading-relaxed">
          For questions about these terms or policy violations, contact: [eirebor1@gmail.com]
        </p>
      </div>
    </div>
  );
}

export function PoliciesPage() {
  const [currentPage, setCurrentPage] = useState<PolicyPage>("main");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-16">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-radial from-red-600/10 via-violet-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-3xl mx-auto px-4 md:px-6 pt-10 md:pt-16 z-10 relative">
        <AnimatePresence mode="wait">
          {currentPage === "main" ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                  Legal & Policies
                </h1>
                <p className="text-slate-400">
                  Important information about using AI Roast My Profile
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setCurrentPage("privacy")}
                  className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition text-left space-y-2"
                >
                  <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
                  <p className="text-sm text-slate-400">
                    How we collect, use, and protect your data
                  </p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setCurrentPage("terms")}
                  className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition text-left space-y-2"
                >
                  <h2 className="text-xl font-bold text-white">Terms of Service</h2>
                  <p className="text-sm text-slate-400">
                    Rules, responsibilities, and acceptable use
                  </p>
                </motion.button>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-3">
                <h3 className="font-bold text-white">Important Notice</h3>
                <p className="text-sm text-slate-300">
                  <strong>Note:</strong> This is an entertainment product. Before deploying publicly, customize the policies above with your actual contact information, jurisdiction, and business details. These are templates and may not be sufficient for all jurisdictions—consult a lawyer if needed.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="policy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setCurrentPage("main")}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 mb-6 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Policies
              </button>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 space-y-6">
                <h1 className="text-3xl font-bold text-white">
                  {currentPage === "privacy" ? "Privacy Policy" : "Terms of Service"}
                </h1>
                <p className="text-xs text-slate-500">
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <div className="prose prose-invert max-w-none">
                  {currentPage === "privacy" ? <PrivacyPolicy /> : <TermsOfService />}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AnimatePresence(props: any) {
  return props.children;
}
