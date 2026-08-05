interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

export function TabButton({ active, onClick, icon, label, count }: TabButtonProps) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
          {count}
        </span>
      )}
    </button>
  );
}