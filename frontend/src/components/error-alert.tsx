type Props = {
  message: string;
};

export function ErrorAlert({ message }: Props) {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      <p className="text-sm text-red-800">{message}</p>
    </div>
  );
}

