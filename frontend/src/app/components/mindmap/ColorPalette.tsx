import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Pipette, Plus } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';
import { Input } from '../ui/input';
import { GOOGLE_THEME_COLORS, GOOGLE_THEME_FLAT } from '../../../lib/mindmapPresetColors';
import {
  addCustomColor,
  isValidHex,
  loadCustomColors,
  normalizeHex,
} from '../../../lib/mindmapPalette';

interface ColorPaletteProps {
  selectedColor: string;
  onPreviewColor: (color: string) => void;
  onCommitColor: (color: string) => void;
}

function useIsMobilePalette() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isMobile;
}

function ColorSwatch({
  color,
  active,
  onClick,
  touchFriendly = false,
}: {
  color: string;
  active: boolean;
  onClick: (color: string) => void;
  touchFriendly?: boolean;
}) {
  const dim = touchFriendly ? 'w-7 h-7' : 'w-[18px] h-[18px]';
  const isWhite = normalizeHex(color) === '#ffffff';

  return (
    <button
      type="button"
      title={color}
      className={`${dim} rounded-full shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
        isWhite ? 'border border-border' : 'border border-black/10'
      } ${active ? 'ring-2 ring-primary ring-offset-1 scale-110' : ''}`}
      style={{ backgroundColor: color }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick(color);
      }}
    />
  );
}

function ColorPaletteBody({
  selectedColor,
  onPreviewColor,
  onCommitColor,
  onClose,
  touchFriendly = false,
}: {
  selectedColor: string;
  onPreviewColor: (color: string) => void;
  onCommitColor: (color: string) => void;
  onClose?: () => void;
  touchFriendly?: boolean;
}) {
  const [customColors, setCustomColors] = useState(loadCustomColors);
  const [hexInput, setHexInput] = useState(selectedColor);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerColor, setPickerColor] = useState(selectedColor);
  const pickerColorRef = useRef(pickerColor);
  pickerColorRef.current = pickerColor;

  useEffect(() => {
    setHexInput(selectedColor);
    setPickerColor(selectedColor);
  }, [selectedColor]);

  const commitColor = useCallback(
    (color: string, options?: { close?: boolean; saveCustom?: boolean }) => {
      if (!isValidHex(color)) {
        toast.error('Mã màu không hợp lệ (ví dụ: #6366f1)');
        return;
      }
      const normalized = normalizeHex(color);
      setHexInput(normalized);
      setPickerColor(normalized);
      if (options?.saveCustom) {
        setCustomColors((prev) => addCustomColor(normalized, prev));
      }
      onCommitColor(normalized);
      if (options?.close) onClose?.();
    },
    [onCommitColor, onClose]
  );

  const applyColor = useCallback(
    (color: string) => commitColor(color, { close: true }),
    [commitColor]
  );

  const addCustom = useCallback(
    (color: string) => commitColor(color, { close: true, saveCustom: true }),
    [commitColor]
  );

  const handlePickerChange = useCallback(
    (color: string) => {
      setPickerColor(color);
      setHexInput(color);
      onPreviewColor(color);
    },
    [onPreviewColor]
  );

  const finishPickerDrag = useCallback(() => {
    const color = pickerColorRef.current;
    if (!isValidHex(color)) return;
    const normalized = normalizeHex(color);
    setCustomColors((prev) => addCustomColor(normalized, prev));
    onCommitColor(normalized);
  }, [onCommitColor]);

  const togglePicker = useCallback(() => {
    setShowPicker((prev) => {
      if (!prev) setPickerColor(selectedColor);
      return !prev;
    });
  }, [selectedColor]);

  const pickFromScreen = useCallback(async () => {
    if (!('EyeDropper' in window)) {
      toast.info('Trình duyệt không hỗ trợ pipette — dùng bảng màu bên dưới');
      return;
    }
    try {
      const dropper = new (window as Window & { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper();
      const { sRGBHex } = await dropper.open();
      addCustom(sRGBHex);
    } catch {
      /* user cancelled */
    }
  }, [addCustom]);

  const activeNorm = normalizeHex(selectedColor);
  const gridCols = touchFriendly ? 'grid-cols-8' : 'grid-cols-10';
  const gridGap = touchFriendly ? 'gap-1.5' : 'gap-[3px]';

  return (
    <>
      <div className="space-y-1">
        {GOOGLE_THEME_COLORS.map((row, rowIdx) => (
          <div key={rowIdx} className={`grid ${gridCols} ${gridGap}`}>
            {row.map((c) => (
              <ColorSwatch
                key={`${rowIdx}-${c}`}
                color={c}
                active={activeNorm === normalizeHex(c)}
                onClick={applyColor}
                touchFriendly={touchFriendly}
              />
            ))}
          </div>
        ))}
      </div>

      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mt-3 mb-2">
        Tùy chỉnh
      </p>
      <div className={`grid ${gridCols} ${gridGap}`}>
        {customColors.map((c) => (
          <ColorSwatch
            key={`custom-${c}`}
            color={c}
            active={activeNorm === normalizeHex(c)}
            onClick={applyColor}
            touchFriendly={touchFriendly}
          />
        ))}
        <button
          type="button"
          title="Chọn màu tùy chỉnh"
          className={`${touchFriendly ? 'w-7 h-7' : 'w-[18px] h-[18px]'} rounded-full border border-dashed flex items-center justify-center hover:border-foreground hover:bg-accent ${
            showPicker ? 'border-primary bg-primary/10' : 'border-muted-foreground/60'
          }`}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            togglePicker();
          }}
        >
          <Plus className={`${touchFriendly ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'} text-muted-foreground`} />
        </button>
        {!touchFriendly && 'EyeDropper' in window && (
          <button
            type="button"
            title="Lấy màu từ màn hình"
            className="w-[18px] h-[18px] rounded-full border border-border flex items-center justify-center hover:bg-accent"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              pickFromScreen();
            }}
          >
            <Pipette className="w-2.5 h-2.5 text-muted-foreground" />
          </button>
        )}
        {activeNorm && !GOOGLE_THEME_FLAT.includes(activeNorm) && !customColors.some((c) => normalizeHex(c) === activeNorm) && (
          <span
            className={`${touchFriendly ? 'w-7 h-7' : 'w-[18px] h-[18px]'} rounded-full border-2 border-primary flex items-center justify-center`}
            style={{ backgroundColor: selectedColor }}
            title="Màu hiện tại"
          >
            <Check className={`${touchFriendly ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'} text-white drop-shadow`} />
          </span>
        )}
      </div>

      {showPicker && (
        <div
          className="mt-3 pt-3 border-t border-border space-y-3"
          onPointerUp={finishPickerDrag}
          onTouchEnd={finishPickerDrag}
        >
          <HexColorPicker
            color={pickerColor}
            onChange={handlePickerChange}
            style={{ width: '100%', touchAction: 'none' }}
          />
          <p className="text-[11px] text-muted-foreground">Kéo để xem trước màu trên node</p>
        </div>
      )}

      <div className="flex gap-1.5 mt-3 pt-3 border-t border-border">
        <Input
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          placeholder="#4a86e8"
          className="h-8 font-mono text-xs flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') addCustom(hexInput);
          }}
        />
        <button
          type="button"
          className="h-8 px-2 text-xs rounded-md border border-border hover:bg-accent shrink-0"
          onClick={() => addCustom(hexInput)}
        >
          OK
        </button>
      </div>
    </>
  );
}

function ColorTrigger({
  selectedColor,
  onClick,
}: {
  selectedColor: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title="Màu node"
      className="shrink-0 flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1.5 hover:bg-accent ml-1"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <span
        className="w-5 h-5 rounded-full border border-black/10 shrink-0"
        style={{ backgroundColor: selectedColor }}
      />
      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
    </button>
  );
}

export function ColorPalette({ selectedColor, onPreviewColor, onCommitColor }: ColorPaletteProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobilePalette();

  const close = useCallback(() => setOpen(false), []);

  if (isMobile) {
    return (
      <>
        <ColorTrigger selectedColor={selectedColor} onClick={() => setOpen(true)} />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto px-4 pb-6 pt-10 rounded-t-2xl">
            <SheetTitle className="text-sm font-medium mb-4 pr-8">Màu node</SheetTitle>
            <ColorPaletteBody
              selectedColor={selectedColor}
              onPreviewColor={onPreviewColor}
              onCommitColor={onCommitColor}
              onClose={close}
              touchFriendly
            />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ColorTrigger selectedColor={selectedColor} />
      </PopoverTrigger>
      <PopoverContent
        className="w-[232px] p-3"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ColorPaletteBody
          selectedColor={selectedColor}
          onPreviewColor={onPreviewColor}
          onCommitColor={onCommitColor}
          onClose={close}
        />
      </PopoverContent>
    </Popover>
  );
}
