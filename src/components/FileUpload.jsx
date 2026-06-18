import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, X, Eye, Image as ImageIcon, FileSpreadsheet, AlertCircle } from 'lucide-react';

// Shared Lightbox Modal component for instant document preview
export const FilePreviewModal = ({ src, alt, onClose }) => {
  if (!src) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 transition-all duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative max-w-4xl max-h-[85vh] w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-full hover:scale-105 transition-all shadow-md z-10"
        >
          <X size={20} />
        </button>
        <img
          src={src}
          alt={alt || "Document preview"}
          className="max-w-full max-h-[80vh] object-contain rounded-lg p-2"
        />
        {alt && (
          <div className="w-full bg-slate-950/90 text-slate-300 py-3 px-6 text-center text-xs font-semibold border-t border-slate-800">
            {alt}
          </div>
        )}
      </div>
    </div>
  );
};

// 1. Single File Upload Card with Drag-and-Drop
export const FileUploadField = ({
  label,
  id,
  file,
  setFile,
  accept = "image/*",
  maxSizeMB = 5,
  disabled = false,
}) => {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    // Handle local File objects or remote URLs
    if (typeof file === 'string') {
      setPreview(file);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (maxSizeMB && selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds limit (${maxSizeMB}MB)`);
      setTimeout(() => setError(null), 4000);
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-1.5 text-left w-full">
      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
        {label}
      </label>
      
      <div 
        className="relative"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          id={id}
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={handleChange}
        />

        {preview ? (
          <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2 shadow-sm transition-all hover:shadow-md flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0 bg-slate-50 dark:bg-slate-950">
              <img
                src={preview}
                alt="File preview"
                className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={() => setShowLightbox(true)}
                  className="p-1 bg-white/20 hover:bg-white/40 text-white rounded-md transition-all scale-90 hover:scale-100"
                  title="Zoom details"
                >
                  <Eye size={12} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold truncate leading-tight">
                {typeof file === 'string' ? file.split('/').pop() : file.name}
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                {typeof file === 'string' ? 'Cloud stored' : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
              </p>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="p-1.5 bg-slate-100 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-colors border border-slate-200/40 dark:bg-slate-800/40 dark:border-slate-750/30"
                title="Remove image"
              >
                <X size={13} />
              </button>
            )}
          </div>
        ) : (
          <label
            htmlFor={id}
            className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center
              ${dragActive 
                ? "border-primary-500 bg-primary-500/5 dark:bg-primary-500/10 scale-[1.01]" 
                : "border-slate-250 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 bg-white/50 hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-900/40"
              }
              ${disabled ? "pointer-events-none opacity-50" : ""}
            `}
          >
            <UploadCloud 
              className={`mb-1 transition-colors ${dragActive ? "text-primary-500" : "text-slate-400 dark:text-slate-500"}`} 
              size={18} 
            />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
              {dragActive ? "Drop to upload" : "Select image"}
            </span>
          </label>
        )}

        {error && (
          <div className="absolute -bottom-6 left-0 right-0 flex items-center gap-1 text-[9px] font-bold text-rose-500 animate-fade-in">
            <AlertCircle size={10} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {showLightbox && preview && (
        <FilePreviewModal
          src={preview}
          alt={label}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </div>
  );
};

// 2. Multiple File Upload Grid with Drag-and-Drop and Lightbox
export const MultipleFileUploadField = ({
  label,
  id,
  files,
  setFiles,
  accept = "image/*",
  maxSizeMB = 5,
  disabled = false,
}) => {
  const [previews, setPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviews([]);
      return;
    }
    // Extract previews for local File objects or remote image strings
    const newPreviews = Array.from(files).map(file => {
      if (typeof file === 'string') return file;
      return URL.createObjectURL(file);
    });
    setPreviews(newPreviews);
    
    // Revoke object URLs on unmount
    return () => {
      newPreviews.forEach(p => {
        if (p.startsWith('blob:')) {
          URL.revokeObjectURL(p);
        }
      });
    };
  }, [files]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const appendFiles = (incomingFiles) => {
    if (!incomingFiles || incomingFiles.length === 0) return;
    
    const validFiles = [];
    let sizeExceeded = false;

    Array.from(incomingFiles).forEach(file => {
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        sizeExceeded = true;
      } else {
        validFiles.push(file);
      }
    });

    if (sizeExceeded) {
      setError(`Some files exceeded the ${maxSizeMB}MB limit`);
      setTimeout(() => setError(null), 4000);
    }

    if (validFiles.length > 0) {
      // Merge with existing files
      const existingArray = files ? Array.from(files) : [];
      const updatedList = [...existingArray, ...validFiles];
      setFiles(updatedList);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      appendFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      appendFiles(e.target.files);
    }
  };

  const removeFile = (indexToRemove) => {
    const updated = Array.from(files).filter((_, idx) => idx !== indexToRemove);
    setFiles(updated);
    if (inputRef.current) inputRef.current.value = "";
  };

  const hasFiles = files && files.length > 0;

  return (
    <div className="space-y-1.5 text-left w-full">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {label}
        </label>
        {hasFiles && !disabled && (
          <button
            type="button"
            onClick={() => {
              setFiles([]);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-[10px] text-rose-500 hover:text-rose-600 font-bold transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div 
        className={`relative p-3 rounded-2xl border-2 border-dashed transition-all bg-white/30 dark:bg-slate-900/20
          ${dragActive 
            ? "border-primary-500 bg-primary-500/5 dark:bg-primary-500/10" 
            : "border-slate-250 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
          }
        `}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          id={id}
          multiple
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={handleChange}
        />

        {hasFiles ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
            {previews.map((preview, idx) => {
              const fileObj = files[idx];
              const name = typeof fileObj === 'string' ? fileObj.split('/').pop() : fileObj?.name;
              
              return (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shadow-sm flex items-center justify-center">
                  <img
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="p-1 bg-white/20 hover:bg-white/40 text-white rounded-lg transition-all scale-90 hover:scale-100"
                      title="Preview details"
                    >
                      <Eye size={12} />
                    </button>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 bg-rose-500/80 hover:bg-rose-500 text-white rounded-lg transition-all scale-90 hover:scale-100"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {!disabled && (
              <label
                htmlFor={id}
                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/60 transition-all group hover:border-primary-500"
              >
                <UploadCloud size={16} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                <span className="text-[9px] font-bold text-slate-500 group-hover:text-primary-500 mt-0.5">Add</span>
              </label>
            )}
          </div>
        ) : (
          <label
            htmlFor={id}
            className={`flex flex-col items-center justify-center py-6 cursor-pointer text-center group ${disabled ? "pointer-events-none" : ""}`}
          >
            <UploadCloud className="text-slate-400 group-hover:text-primary-500 transition-colors mb-1.5" size={24} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Drag & drop photos here
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              or click to browse local files
            </span>
          </label>
        )}

        {error && (
          <div className="absolute -bottom-6 left-0 right-0 flex items-center gap-1 text-[9px] font-bold text-rose-500">
            <AlertCircle size={10} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {lightboxIndex !== null && previews[lightboxIndex] && (
        <FilePreviewModal
          src={previews[lightboxIndex]}
          alt={`Verification scan index: ${lightboxIndex + 1}`}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};

// 3. Document or Spreadsheet upload field with spreadsheet details
export const ExcelFileUploadField = ({
  label,
  id,
  file,
  setFile,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetExcel = (selectedFile) => {
    if (!selectedFile) return;

    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (extension !== 'xlsx' && extension !== 'xls') {
      setError("Only Microsoft Excel files (.xlsx, .xls) are allowed");
      setTimeout(() => setError(null), 4000);
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetExcel(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetExcel(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-1.5 text-left w-full">
      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
        {label}
      </label>

      <div
        className="relative"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          id={id}
          accept=".xlsx, .xls"
          disabled={disabled}
          className="hidden"
          onChange={handleChange}
        />

        {file ? (
          <div className="flex items-center gap-3 p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-xl relative shadow-sm">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-500 flex-shrink-0">
              <FileSpreadsheet size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-800 dark:text-emerald-350 font-bold truncate">
                {file.name}
              </p>
              <p className="text-[9px] text-slate-550 dark:text-slate-400 mt-0.5">
                {(file.size / 1024).toFixed(1)} KB • Ready to parse
              </p>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="p-1.5 bg-emerald-500/10 hover:bg-rose-500/15 text-emerald-600 hover:text-rose-500 rounded-lg border border-emerald-500/10 transition-colors"
                title="Clear spreadsheet file"
              >
                <X size={13} />
              </button>
            )}
          </div>
        ) : (
          <label
            htmlFor={id}
            className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center
              ${dragActive
                ? "border-emerald-500 bg-emerald-500/5 scale-[1.01]"
                : "border-slate-250 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white/50 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-900/40"
              }
              ${disabled ? "pointer-events-none opacity-50" : ""}
            `}
          >
            <UploadCloud
              className={`mb-1 transition-colors ${dragActive ? "text-emerald-500" : "text-slate-400 dark:text-slate-500"}`}
              size={20}
            />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350">
              {dragActive ? "Drop spreadsheet here" : "Browse excel file"}
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5">
              Supports .xlsx or .xls templates
            </span>
          </label>
        )}

        {error && (
          <div className="absolute -bottom-6 left-0 right-0 flex items-center gap-1 text-[9px] font-bold text-rose-500">
            <AlertCircle size={10} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
