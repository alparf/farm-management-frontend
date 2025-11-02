import { 
  Edit, 
  Trash2, 
  CheckCircle, 
  Calendar, 
  Undo2, 
  AlertTriangle, 
  PackageX, 
  Package,
  Plus,
  Car,
  Wrench,
  Beaker,
  Shield,
  Bug,
  Flower2,
  Droplets,
  TrendingUp,
  Sprout,
  Leaf,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

// Иконки для действий
export const ActionIcons = {
  Edit: Edit,
  Delete: Trash2,
  Check: CheckCircle,
  Calendar: Calendar,
  Undo: Undo2,
  Warning: AlertTriangle,
  PackageEmpty: PackageX,
  PackageFull: Package,
  Add: Plus,
  Close: X
};

// Иконки для типов сущностей
export const EntityIcons = {
  Vehicle: Car,
  Maintenance: Wrench,
  Treatment: Beaker,
  Fungicide: Shield,
  Insecticide: Bug,
  Herbicide: Flower2,
  Desiccant: Droplets,
  GrowthRegulator: TrendingUp,
  Fertilizer: Sprout,
  Biological: Leaf
};

// Иконки для интерфейса
export const InterfaceIcons = {
  ChevronDown: ChevronDown,
  ChevronUp: ChevronUp
};

// Пользовательские иконки
export const CustomIcons = {
  BeakerIcon: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  )
};

// Хелперы для кнопок
export const ButtonIcons = {
  Edit: {
    icon: Edit,
    className: "h-4 w-4",
    variant: "outline" as const,
    title: "Редактировать"
  },
  Delete: {
    icon: Trash2,
    className: "h-4 w-4",
    variant: "outline" as const,
    title: "Удалить",
    style: "text-red-600 hover:bg-red-50"
  },
  Check: {
    icon: CheckCircle,
    className: "h-4 w-4",
    variant: "outline" as const,
    title: "Выполнить",
    style: "text-green-600 hover:bg-green-50"
  },
  Undo: {
    icon: Undo2,
    className: "h-4 w-4",
    variant: "outline" as const,
    title: "Отменить выполнение",
    style: "text-gray-600 hover:bg-gray-100"
  }
};

// Размеры кнопок
export const ButtonSizes = {
  sm: "h-8 w-8 p-0",
  md: "h-9 w-9 p-0",
  lg: "h-10 w-10 p-0"
};