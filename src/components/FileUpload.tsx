import { useRef, useCallback } from "react";
import { Upload, FileText } from "lucide-react";
import { formatFileSize } from "@/utils/helpers";

interface FileUploadProps {
  uploadedFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

export default function FileUpload({
  uploadedFiles,
  onAddFiles,
  onRemoveFile,
  isUploading = false,
  uploadProgress = 0,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    console.log(
      "Files selected:",
      files.length,
      files.map((f) => f.name)
    );
    onAddFiles(files);
    // Reset the input value to allow selecting the same file again
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove("border-blue-400", "bg-blue-50/20");
      const files = Array.from(e.dataTransfer.files);
      console.log("Files dropped:", files.length);
      onAddFiles(files);
    },
    [onAddFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.add("border-blue-400", "bg-blue-50/20");
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove("border-blue-400", "bg-blue-50/20");
    },
    []
  );

  return (
    <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
      <div
        className="border-3 border-dashed border-white/30 rounded-3xl p-10 md:p-16 text-center transition-all duration-500 cursor-pointer hover:border-purple-400 hover:bg-white/5 group relative overflow-hidden"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload documents"
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
          {isUploading ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse shadow-2xl shadow-green-500/25">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Processing Files...
              </h3>
              <div className="w-full max-w-md mx-auto mb-6">
                <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-slate-200 mt-2 text-center">
                  {uploadProgress}% Complete
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 shadow-2xl shadow-purple-500/25 group-hover:shadow-purple-500/40">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Upload Your Documents
              </h3>
              <p className="text-slate-200 mb-6 text-lg">
                Drop files here or click to browse
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300 font-medium">
                  Supports PDF, DOC, DOCX, TXT, PPT, PPTX, Images
                </span>
              </div>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.bmp,.tiff,.tif,.gif,.webp"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="File input"
        />
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          {uploadedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between bg-white/20 rounded-xl p-4 group hover:bg-white/30 transition-colors duration-200"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium truncate">{file.name}</p>
                  <p className="text-purple-200 text-sm">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(index)}
                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0 ml-4"
                aria-label={`Remove ${file.name}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
