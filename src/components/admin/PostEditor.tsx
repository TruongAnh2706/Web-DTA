
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import {
    Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote,
    Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon,
    Heading1, Heading2, Heading3, Undo, Redo
} from 'lucide-react';
import { useCallback } from 'react';

interface PostEditorProps {
    content: string;
    onChange: (html: string) => void;
}

const PostEditor = ({ content, onChange }: PostEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Youtube.configure({
                controls: false,
            }),
            Link.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder: 'Write something amazing...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
    });

    const addImage = useCallback(() => {
        const url = window.prompt('Enter image URL');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const addYoutube = useCallback(() => {
        const url = window.prompt('Enter YouTube URL');
        if (url && editor) {
            editor.commands.setYoutubeVideo({ src: url });
        }
    }, [editor]);

    const setLink = useCallback(() => {
        const previousUrl = editor?.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor?.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-input rounded-2xl overflow-hidden glass-card">
            {/* Toolbar */}
            <div className="bg-muted/50 p-2 flex flex-wrap gap-1 border-b border-input">
                <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
                    <Strikethrough className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" pressed={editor.isActive('codeBlock')} onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}>
                    <Code className="h-4 w-4" />
                </Toggle>

                <div className="w-px h-6 bg-border mx-1" />

                <Toggle size="sm" pressed={editor.isActive('heading', { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                    <Heading1 className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    <Heading2 className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" pressed={editor.isActive('heading', { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                    <Heading3 className="h-4 w-4" />
                </Toggle>

                <div className="w-px h-6 bg-border mx-1" />

                <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
                    <List className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
                    <ListOrdered className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" pressed={editor.isActive('blockquote')} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}>
                    <Quote className="h-4 w-4" />
                </Toggle>

                <div className="w-px h-6 bg-border mx-1" />

                <Button variant="ghost" size="sm" onClick={setLink} className={editor.isActive('link') ? 'bg-secondary' : ''}>
                    <LinkIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={addImage}>
                    <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={addYoutube}>
                    <YoutubeIcon className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                    <Undo className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            {/* Editor Content */}
            <div className="min-h-[300px] cursor-text bg-background/50">
                <EditorContent editor={editor} />
            </div>

            <style>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }
            `}</style>
        </div>
    );
};

export default PostEditor;
