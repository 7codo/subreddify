import Header from "./header";

type Props = {
  children: React.ReactNode;
  rightChildren?: React.ReactNode;
  title?: string;
};

const PageWrapper: React.FC<Props> = ({ children, title, rightChildren }) => {
  return (
    <section className="h-full flex flex-col">
      <Header title={title} rightChildren={rightChildren} />
      <main className="flex-1 px-6 p-3 overflow-y-auto">{children}</main>
    </section>
  );
};

export default PageWrapper;
