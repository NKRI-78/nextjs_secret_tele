"use client";

import { FaPlus, FaTimes } from "react-icons/fa";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setSearchKeyword } from "@redux/slices/searchSlice";

const SearchBar = () => {
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitSearch = () => {
    if (selectedImage) {
      console.log("Submit image:", selectedImage);
      return;
    }

    if (!value.trim()) return;
    dispatch(setSearchKeyword(value.trim().toLowerCase()));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setValue("");
    e.target.value = "";
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="relative flex items-center h-12 rounded-full bg-white/10 border border-white/20 overflow-hidden">
        <button
          type="button"
          onClick={!selectedImage ? openFilePicker : undefined}
          disabled={!!selectedImage}
          className={`
    h-full px-4 flex items-center justify-center
    shrink-0 transition
    ${
      selectedImage
        ? "text-white/30 cursor-not-allowed"
        : "text-white/70 hover:text-white"
    }
  `}
        >
          <FaPlus size={14} />
        </button>

        <div className="relative flex-1 h-full">
          {/* TEXT INPUT (struktur tetap) */}
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            placeholder={selectedImage ? "" : "Masukan kata dalam pencarian..."}
            disabled={!!selectedImage}
            className="
    w-full h-full bg-transparent px-2
    text-sm text-white placeholder:text-white/40
    focus:outline-none
    disabled:cursor-not-allowed
  "
          />

          {/* IMAGE OVERLAY */}
          {selectedImage && (
            <div className="absolute inset-0 flex items-center gap-2 px-2 bg-cyber/60 backdrop-blur-sm">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="preview"
                className="h-8 w-8 object-cover rounded-md"
              />

              <span className="text-sm text-white truncate max-w-[200px]">
                {selectedImage.name}
              </span>

              <button
                onClick={removeImage}
                className="text-white/60 hover:text-red-400 transition"
              >
                <FaTimes size={12} />
              </button>
            </div>
          )}
        </div>

        {/* ANALYSIS BUTTON  */}
        <button
          onClick={submitSearch}
          className="
            shrink-0
            h-full px-6
            bg-blue-button hover:bg-blue-600
            text-white text-sm font-semibold
            transition
          "
        >
          Analysis
        </button>

        {/* HIDDEN FILE INPUT */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default SearchBar;
