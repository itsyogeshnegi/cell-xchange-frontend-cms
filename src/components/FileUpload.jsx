import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, X, Eye, Image as ImageIcon, FileSpreadsheet, AlertCircle, Camera, RefreshCw } from 'lucide-react';

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

// 0. Live Camera Capture Modal
export const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // environment = back camera, user = front camera
  const [devices, setDevices] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let activeStream = null;

    const startCamera = async () => {
      try {
        // Enumerate devices first to see if camera switching is supported
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);

        // Standard constraint configuration
        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = newStream;
        setStream(newStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        alert("Camera access denied or device not found. Please verify permissions.");
        onClose();
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas size to match live video stream feed resolution
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
    }
  };

  const savePhoto = () => {
    if (capturedImage) {
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `live-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
          onCapture(file);
          handleClose();
        })
        .catch(err => {
          console.error("Error creating file from captured image:", err);
        });
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCapturedImage(null);
    onClose();
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[75vh] max-h-[550px] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Take Live Photo</span>
          <button type="button" onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Video stream view */}
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured preview" className="max-w-full max-h-full object-contain" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Bottom controls */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/60 flex flex-col items-center gap-3">
          {capturedImage ? (
            <div className="flex gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setCapturedImage(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 py-2 px-4 rounded-xl text-xs font-semibold transition-all"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={savePhoto}
                className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-950/10"
              >
                Use Photo
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full max-w-[240px]">
              {/* Toggle camera orientation (front/back) */}
              <button
                type="button"
                onClick={toggleFacingMode}
                disabled={devices.length <= 1}
                className="p-2.5 bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-200 rounded-full transition-all border border-slate-700"
                title="Toggle camera front/back"
              >
                <RefreshCw size={14} />
              </button>

              {/* Take photo trigger shutter */}
              <button
                type="button"
                onClick={capturePhoto}
                className="p-1 bg-white hover:bg-slate-100 rounded-full transition-all flex items-center justify-center border-2 border-slate-800"
              >
                <div className="w-10 h-10 bg-rose-500 rounded-full hover:scale-95 transition-all flex items-center justify-center">
                  <Camera size={18} className="text-white" />
                </div>
              </button>

              {/* Spacing alignment placeholder */}
              <div className="w-[36px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 1. Single File Upload Card with Drag-and-Drop + Live Webcam
export const FileUploadField = ({
  label,
  id,
  file,
  setFile,
  accept = "image/*",
  maxSizeMB = 5,
  disabled = false,
  onRemove,
}) => {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
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

        {preview && file ? (
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
                {file ? (typeof file === 'string' ? file.split('/').pop() : file.name) : ''}
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                {file ? (typeof file === 'string' ? 'Cloud stored' : `${(file.size / 1024 / 1024).toFixed(2)} MB`) : ''}
              </p>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                  if (onRemove) onRemove();
                }}
                className="p-1.5 bg-slate-100 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-colors border border-slate-200/40 dark:bg-slate-800/40 dark:border-slate-750/30"
                title="Remove image"
              >
                <X size={13} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-2 w-full">
            {/* Click to upload slot */}
            <label
              htmlFor={id}
              className={`flex-1 flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center group
                ${dragActive 
                  ? "border-primary-500 bg-primary-500/5 dark:bg-primary-500/10 scale-[1.01]" 
                  : "border-slate-250 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 bg-white/50 hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-900/40"
                }
                ${disabled ? "pointer-events-none opacity-50" : ""}
              `}
            >
              <UploadCloud 
                className={`mb-1 transition-colors ${dragActive ? "text-primary-500" : "text-slate-400 dark:text-slate-500 group-hover:text-primary-500"}`} 
                size={18} 
              />
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary-500 transition-colors">
                {dragActive ? "Drop files" : "Select File"}
              </span>
            </label>

            {/* Click to capture live webcam photo */}
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              disabled={disabled}
              className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-250 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 bg-white/50 hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-900/40 rounded-xl cursor-pointer transition-all text-center group"
            >
              <Camera className="mb-1 text-slate-400 group-hover:text-primary-500 transition-colors" size={18} />
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary-500 transition-colors">
                Camera
              </span>
            </button>
          </div>
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

      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={validateAndSetFile}
      />
    </div>
  );
};

// 2. Multiple File Upload Grid + Live Camera Capture options
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
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviews([]);
      return;
    }
    const newPreviews = Array.from(files).map(file => {
      if (typeof file === 'string') return file;
      return URL.createObjectURL(file);
    });
    setPreviews(newPreviews);
    
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
            {previews.map((preview, idx) => (
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
            ))}

            {/* In-grid Add items slots: split between local browser upload and live camera capture */}
            {!disabled && (
              <div className="aspect-square flex gap-1 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-slate-200 dark:border-slate-800/85">
                <label
                  htmlFor={id}
                  className="flex-1 flex flex-col items-center justify-center rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-all group"
                  title="Browse local files"
                >
                  <UploadCloud size={14} className="text-slate-450 group-hover:text-primary-500 transition-colors" />
                  <span className="text-[7.5px] font-bold text-slate-500 group-hover:text-primary-500 mt-0.5">Files</span>
                </label>
                <div className="w-[1px] bg-slate-200 dark:bg-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex-1 flex flex-col items-center justify-center rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-all group"
                  title="Take live photo"
                >
                  <Camera size={14} className="text-slate-450 group-hover:text-primary-500 transition-colors" />
                  <span className="text-[7.5px] font-bold text-slate-500 group-hover:text-primary-500 mt-0.5">Camera</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <UploadCloud className="text-slate-450 mb-1.5" size={24} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
              Drag & drop photos here
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 mb-3.5">
              or use one of the options below
            </span>
            <div className="flex gap-2">
              <label
                htmlFor={id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg cursor-pointer text-[10px] font-bold text-slate-650 dark:text-slate-300 transition-all hover:scale-[1.02] shadow-sm shadow-slate-950/5"
              >
                <UploadCloud size={12} />
                Browse Files
              </label>
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                disabled={disabled}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-650 dark:text-slate-300 transition-all hover:scale-[1.02] shadow-sm shadow-slate-950/5"
              >
                <Camera size={12} />
                Take Photo
              </button>
            </div>
          </div>
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

      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(file) => appendFiles([file])}
      />
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
