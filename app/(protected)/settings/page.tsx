import { ClerkProfileSettings } from "./_components/clerk-profile-settings";
import { createMetadata } from "@/lib/constants/metadata";

export const metadata = createMetadata({
  title: "Account Settings",
  description: "Account settings.",
});

type Props = {};

const SettingsPage: React.FC<Props> = (props) => {
  return <ClerkProfileSettings />;
};

export default SettingsPage;
