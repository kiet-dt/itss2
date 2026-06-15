import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LayoutTemplate, ChevronDown } from 'lucide-react';
import { TEMPLATE_NAMES } from '../../lib/mindmapTemplates';

interface TemplateSelectorProps {
  onSelect: (templateName: string) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="nodrag nopan nowheel shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent text-sm transition-colors cursor-pointer"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <LayoutTemplate className="w-4 h-4" />
          Template
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[240px] bg-card border border-border rounded-lg shadow-xl p-1 max-h-80 overflow-y-auto"
          style={{ zIndex: 9999 }}
          sideOffset={4}
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {TEMPLATE_NAMES.map((name) => (
            <DropdownMenu.Item
              key={name}
              className="px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-accent outline-none select-none"
              onSelect={(e) => {
                e.preventDefault();
                onSelect(name);
              }}
            >
              {name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
