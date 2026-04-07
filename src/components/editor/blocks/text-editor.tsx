'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import type { TextBlock } from '@/types/block';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, LinkIcon } from 'lucide-react';

interface TextEditorProps {
  content: TextBlock['content'];
  preview: boolean;
  onChange: (content: TextBlock['content']) => void;
}

export function TextEditor({ content, preview, onChange }: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: false,
        link: {
          openOnClick: false,
          HTMLAttributes: { class: 'text-primary underline' },
        },
      }),
    ],
    content: content.html,
    onUpdate: ({ editor }) => {
      onChange({ html: editor.getHTML() });
    },
    immediatelyRender: false,
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && !editor.isFocused) {
      const currentHTML = editor.getHTML();
      if (currentHTML !== content.html) {
        editor.commands.setContent(content.html);
      }
    }
  }, [content.html, editor]);

  if (preview) {
    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: content.html || '<p class="text-muted-foreground">내용 없음</p>' }}
      />
    );
  }

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1 rounded-md border bg-muted/50 p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive('bold')}
        >
          <Bold className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive('italic')}
        >
          <Italic className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive('bulletList')}
        >
          <List className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive('orderedList')}
        >
          <ListOrdered className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => {
            const url = window.prompt('URL을 입력하세요');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          data-active={editor.isActive('link')}
        >
          <LinkIcon className="size-3.5" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[120px] rounded-md border p-3 prose prose-sm max-w-none focus-within:ring-2 focus-within:ring-ring"
      />
    </div>
  );
}
