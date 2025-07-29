

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  allowClear?: boolean;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className,
  error = false,
  allowClear = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Normalizar fecha a medianoche local para evitar problemas de zona horaria
      const normalizedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      
      console.log('📅 DatePicker selección:', {
        fechaSeleccionada: selectedDate,
        fechaNormalizada: normalizedDate,
        fechaLocal: normalizedDate.toLocaleDateString('es-ES'),
        zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      onSelect(normalizedDate);
    } else {
      onSelect(undefined);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-cream-50 border-sage-200 focus:border-rose-300 h-12 sm:h-10 touch-manipulation",
            !date && "text-muted-foreground",
            error && "border-red-500 focus:border-red-500",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            <span className="flex-1">
              {format(date, "d 'de' MMMM, yyyy", { locale: es })}
            </span>
          ) : (
            <span className="flex-1">{placeholder}</span>
          )}
          {allowClear && date && !disabled && (
            <X 
              className="h-4 w-4 ml-2 hover:text-red-500 transition-colors" 
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className="p-3 pointer-events-auto"
          locale={es}
          disabled={(date) => {
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today
            return date > today || date < new Date("1900-01-01");
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

