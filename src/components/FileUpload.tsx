import React, { useCallback, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { formatFileSize } from '@/utils/helpers';

interface FileUploadProps {
  uploadedFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

export default function FileUpload({ uploadedFiles, onAddFiles, onRemoveFile }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    onAddFiles(files);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
    const files = Array.from(e.dataTransfer.files);
    onAddFiles(files);
  }, [onAddFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.currentTarget.classList.add("border-blue-400", "bg-blue-50/20");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-400", "bg-blue-50/20");
  }, []);

  return (
    <section className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">Upload Documents</h2>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="border-2 border-dashed border-white/30 rounded-2xl p-8 text-center hover:border-white/50 transition-colors duration-200 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          Drop files here or click to browse
        </h3>
        <p className="text-purple-200 text-sm">
          Supports PDF, DOCX, DOC, PPTX, PPT, TXT files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-white mb-4">Uploaded Files</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-purple-200 text-sm">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(index)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
