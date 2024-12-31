import { CircleAlertIcon } from 'lucide-react';

export default function EmptyPageMessage({
  message,
  children,
}: {
  message: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-16">
      <CircleAlertIcon />
      <p className="my-4 text-lg text-center">{message}</p>
      {children}
    </div>
  );
}
