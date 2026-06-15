import { useState, useRef } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FileCode2, ChevronDown } from 'lucide-react';
import { PSEUDOCODE_TEMPLATES } from '../../lib/pseudocodeTemplates';

interface PseudocodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  editCount: number;
  onEditTrack: (edits: number, rewrites: number) => void;
}

export function PseudocodeEditor({ value, onChange, editCount, onEditTrack }: PseudocodeEditorProps) {
  const prevRef = useRef(value);
  const rewriteRef = useRef(0);

  const handleChange = (newVal: string) => {
    const prev = prevRef.current;
    if (newVal.length < prev.length * 0.5 && prev.length > 20) {
      rewriteRef.current += 1;
    }
    prevRef.current = newVal;
    onChange(newVal);
    onEditTrack(editCount + 1, rewriteRef.current);
  };

  const insertTemplate = (text: string) => {
    const sep = value.trim() ? '\n\n' : '';
    handleChange(value + sep + text);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 overflow-auto">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="flex items-center gap-2 font-medium text-sm">
          <FileCode2 className="w-4 h-4 text-primary" />
          Mã giả
        </h3>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent text-sm transition-colors">
            Chèn mẫu
            <ChevronDown className="w-3 h-3 opacity-60" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[200px] bg-card border border-border rounded-lg shadow-xl p-1 z-50 max-h-72 overflow-y-auto">
              {Object.entries(PSEUDOCODE_TEMPLATES).map(([name, tpl]) => (
                <DropdownMenu.Item
                  key={name}
                  className="px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-accent outline-none"
                  onSelect={() => insertTemplate(tpl)}
                >
                  {name}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div className="flex-1 min-h-[200px] rounded-xl border border-border/60 bg-card shadow-inner overflow-hidden ring-1 ring-border/30 focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Viết mã giả của bạn — chỉ khung tư duy, không cần hoàn hảo.

1. Xác định input / output
2. Chia nhỏ các bước xử lý
3. Xử lý edge case
4. Ghi chú độ phức tạp (nếu có)`}
          className="w-full h-full min-h-[240px] p-5 bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Chỉnh sửa: {editCount} • Viết lại: {rewriteRef.current}
      </p>
    </div>
  );
}
