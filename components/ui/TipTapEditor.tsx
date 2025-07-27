"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { TextEditorProps } from "@/app/interfaces/texteditor/texteditor";

import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Document from "@tiptap/extension-document";
import Color from "@tiptap/extension-color";
import Heading from "@tiptap/extension-heading";
import { TextStyle } from "@tiptap/extension-text-style";
import Paragraph from "@tiptap/extension-paragraph";
import Image from "@tiptap/extension-image";
import Text from "@tiptap/extension-text";

const TiptapEditor: React.FC<TextEditorProps> = ({ onValueChange, value }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Heading.configure({ levels: [1, 2, 3] }),
      Highlight,
      TextStyle,
      Color,
      Document,
      Paragraph,
      Text,
      Image,
    ],
    content: value,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onValueChange(html);
    },
  });

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const alt = prompt("Enter image alt text:") || "";
        editor.chain().focus().setImage({ src: base64, alt }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border p-4 rounded-lg bg-white shadow-md">
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          {
            label: "Bold",
            action: () => editor?.chain().focus().toggleBold().run(),
          },
          {
            label: "Italic",
            action: () => editor?.chain().focus().toggleItalic().run(),
          },
          {
            label: "Highlight",
            action: () => editor?.chain().focus().toggleHighlight().run(),
          },
          {
            label: "Blockquote",
            action: () => editor?.chain().focus().toggleBlockquote().run(),
          },
          {
            label: "H1",
            action: () =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run(),
          },
          {
            label: "H2",
            action: () =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run(),
          },
          {
            label: "H3",
            action: () =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run(),
          },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {label}
          </button>
        ))}

        <input
          type="color"
          title="Text Color"
          className="h-8 w-10 cursor-pointer border rounded"
          onChange={(e) =>
            editor?.chain().focus().setColor(e.target.value).run()
          }
        />

        <button
          onClick={() => editor?.chain().focus().unsetColor().run()}
          className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500 transition"
        >
          Clear Color
        </button>

        <label className="px-3 py-1 text-sm bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 transition">
          Upload Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      <EditorContent
        className="prose-editor min-h-[200px] p-4 border rounded text-black focus:outline-none"
        editor={editor}
      />
    </div>
  );
};

export default TiptapEditor;
