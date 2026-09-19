import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, CheckCircle, Clock } from 'lucide-react';

interface MaintenanceCardEditProps {
  editData: {
    date: string;
    hours: string;
    description: string;
    notes: string;
    completed: boolean;
  };
  onUpdateField: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function MaintenanceCardEdit({
  editData,
  onUpdateField,
  onSave,
  onCancel,
}: MaintenanceCardEditProps) {
  return (
    <div className="space-y-3">
      {/* Статус */}
      <div>
        <Label className="text-xs text-gray-600">Статус заявки</Label>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => onUpdateField('completed', false)}
            className={`flex-1 h-9 rounded-md border flex items-center justify-center gap-1.5 text-sm transition-colors ${
              !editData.completed
                ? 'bg-orange-50 border-orange-300 text-orange-700 font-medium'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Не выполнена
          </button>
          <button
            type="button"
            onClick={() => onUpdateField('completed', true)}
            className={`flex-1 h-9 rounded-md border flex items-center justify-center gap-1.5 text-sm transition-colors ${
              editData.completed
                ? 'bg-green-50 border-green-300 text-green-700 font-medium'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Выполнена
          </button>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-600">Дата</Label>
        <Input
          type="date"
          value={editData.date}
          onChange={(e) => onUpdateField('date', e.target.value)}
          className="mt-1 h-9"
        />
      </div>

      <div>
        <Label className="text-xs text-gray-600">Моточасы</Label>
        <Input
          type="number"
          step="0.1"
          value={editData.hours}
          onChange={(e) => onUpdateField('hours', e.target.value)}
          placeholder="Например: 1250.5"
          className="mt-1 h-9"
        />
      </div>

      <div>
        <Label className="text-xs text-gray-600">Описание работ</Label>
        <Textarea
          value={editData.description}
          onChange={(e) => onUpdateField('description', e.target.value)}
          placeholder="Что было сделано..."
          rows={3}
          className="mt-1 text-sm"
        />
      </div>

      <div>
        <Label className="text-xs text-gray-600">Примечания</Label>
        <Textarea
          value={editData.notes}
          onChange={(e) => onUpdateField('notes', e.target.value)}
          placeholder="Дополнительная информация..."
          rows={2}
          className="mt-1 text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="h-8 px-3 text-green-600 hover:bg-green-50"
        >
          <Save className="h-3.5 w-3.5 mr-1" />
          Сохранить
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="h-8 px-3 text-gray-500 hover:bg-gray-100"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Отмена
        </Button>
      </div>
    </div>
  );
}