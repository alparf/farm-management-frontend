import { RefreshCw } from 'lucide-react';

export function LoadingState({ message }: { message: string }) {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
}