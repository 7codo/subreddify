import Script from "next/script";

import { Footer } from "./_components/footer";
import Header from "./_components/header";

type Props = {
  children: React.ReactNode;
};

const page: React.FC<Props> = ({ children }) => {
  return (
    <>
      <div className="min-h-screen flex flex-col gap-y-2">
        <Header />
        <main className="flex-1 min-h-screen sm:px-6">{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default page;
