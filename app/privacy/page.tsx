import { PrivacyPolicyView } from "@/domains/profile/privacy-policy-page";

// Public copy of the in-app policy, linked from the sign-up screen
// before the visitor has an account.
export default function PrivacyPage() {
  return <PrivacyPolicyView />;
}
