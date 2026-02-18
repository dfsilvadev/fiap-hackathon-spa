import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
  required?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minHeight = 280,
  required,
}: MarkdownEditorProps) {
  return (
    <div data-color-mode="light" className="rounded-xl overflow-hidden border border-slate-200">
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? '')}
        height={minHeight}
        visibleDragbar={false}
        preview="live"
        hideToolbar={false}
        enableScroll={true}
        textareaProps={{
          placeholder,
          required,
        }}
      />
    </div>
  )
}
