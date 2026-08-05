import { Button } from '@/components/ui/button';

export function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-red-800 font-medium">Ошибка загрузки</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
        <Button variant="outline" onClick={onRetry}>
          Повторить
        </Button>
      </div>
    </div>
  );
}