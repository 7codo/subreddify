import { ClerkProfileSettings } from "../_components/clerk-profile-settings";

import { createMetadata } from "@/lib/constants/metadata";

export const metadata = createMetadata({
  title: "Security Settings",
  description: "Security settings.",
});

type Props = {};

const SecurityPage: React.FC<Props> = (props) => {
  return <ClerkProfileSettings />;
};

export default SecurityPage;
