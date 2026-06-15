import {
  Plus, Trash2, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2,
  Download,
} from 'lucide-react';
import { TemplateSelector } from '../TemplateSelector';
import { ColorPalette } from './ColorPalette';

interface MindmapToolbarProps {
  selectedColor: string;
  onAddNode: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onSelectTemplate: (name: string) => void;
  onPreviewColor: (color: string) => void;
  onCommitColor: (color: string) => void;
  onExportPng: () => void;
  onExportJson: () => void;
}

function ToolBtn({
  onClick,
  children,
  active,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`shrink-0 cursor-pointer p-2 rounded-lg border transition-colors select-none ${
        active ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background hover:bg-accent'
      }`}
    >
      {children}
    </button>
  );
}

export function MindmapToolbar({
  selectedColor,
  onAddNode,
  onDelete,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onSelectTemplate,
  onPreviewColor,
  onCommitColor,
  onExportPng,
  onExportJson,
}: MindmapToolbarProps) {
  return (
    <header className="mindmap-editor__toolbar flex items-center gap-2 px-2 sm:px-4 py-2 border-b border-border bg-card shadow-sm overflow-x-auto scrollbar-thin">
      <ToolBtn onClick={onAddNode} title="Thêm node">
        <Plus className="w-4 h-4 pointer-events-none" />
      </ToolBtn>
        <ToolBtn onClick={onDelete} title="Xóa node hoặc đường đã chọn">
        <Trash2 className="w-4 h-4 pointer-events-none" />
      </ToolBtn>
      <ToolBtn onClick={onUndo} title="Hoàn tác">
        <Undo2 className="w-4 h-4 pointer-events-none" />
      </ToolBtn>
      <ToolBtn onClick={onRedo} title="Làm lại">
        <Redo2 className="w-4 h-4 pointer-events-none" />
      </ToolBtn>
      <ToolBtn onClick={onZoomIn} title="Phóng to">
        <ZoomIn className="w-4 h-4 pointer-events-none" />
      </ToolBtn>
      <ToolBtn onClick={onZoomOut} title="Thu nhỏ">
        <ZoomOut className="w-4 h-4 pointer-events-none" />
      </ToolBtn>
      <ToolBtn onClick={onFitView} title="Vừa màn hình">
        <Maximize2 className="w-4 h-4 pointer-events-none" />
      </ToolBtn>
      <TemplateSelector onSelect={onSelectTemplate} />
      <ColorPalette
        selectedColor={selectedColor}
        onPreviewColor={onPreviewColor}
        onCommitColor={onCommitColor}
      />
      <ToolBtn onClick={onExportPng} title="Xuất PNG">
        <Download className="w-4 h-4 pointer-events-none" />
      </ToolBtn>
      <ToolBtn onClick={onExportJson} title="Xuất JSON">
        <Download className="w-4 h-4 pointer-events-none" />
      </ToolBtn>
    </header>
  );
}
