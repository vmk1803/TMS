import React, { useEffect, useRef, useState } from "react";
import { FileText, AlertCircle, Trash2 } from 'lucide-react'


type Props = {
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  showInlinePreview?: boolean;
};

const allowedTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const maxSizeMB = 10;

const FileUploadBox: React.FC<Props> = ({ onFileSelect, onFileRemove, showInlinePreview = true }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

  const handleBoxClick = () => {
    fileInputRef.current?.click(); //  Trigger hidden file input
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError('');

    if (!selectedFile) return;

    // Validate file type
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Unsupported file format. Only PNG, PDF, JPG, JPEG, DOCX are accepted.');
      setTimeout(() => setError(''), 5000);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB.`);
      setTimeout(() => setError(''), 5000);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (onFileSelect) onFileSelect(selectedFile);
    setFile(selectedFile)
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileRemove) onFileRemove();
  };


  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return (
    <>
      {/* Warning Message */}
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      <div
        onClick={handleBoxClick}
        className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-green-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 transition"
      >
        <span className="mb-3">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.25 16.25C16.25 15.5596 15.6904 15 15 15C14.3096 15 13.75 15.5596 13.75 16.25H15H16.25ZM13.75 26.25C13.75 26.9404 14.3096 27.5 15 27.5C15.6904 27.5 16.25 26.9404 16.25 26.25H15H13.75ZM10.3661 17.8661C9.87796 18.3543 9.87796 19.1457 10.3661 19.6339C10.8543 20.122 11.6457 20.122 12.1339 19.6339L11.25 18.75L10.3661 17.8661ZM16.4142 16.4142L17.2981 15.5303L17.2981 15.5303L16.4142 16.4142ZM17.8661 19.6339C18.3543 20.122 19.1457 20.122 19.6339 19.6339C20.122 19.1457 20.122 18.3543 19.6339 17.8661L18.75 18.75L17.8661 19.6339ZM14.6137 15.5789L15 16.7678H15L14.6137 15.5789ZM15.3863 15.5789L15 16.7678L15.3863 15.5789ZM22.492 8.87341L22.7391 7.64807H22.7391L22.492 8.87341ZM8.87341 7.50798L7.64807 7.26092V7.26092L8.87341 7.50798ZM21.1266 7.50798L19.9013 7.75504V7.75504L21.1266 7.50798ZM7.50798 8.87341L7.26092 7.64807H7.26092L7.50798 8.87341ZM23.2495 19.5845C22.6169 19.8609 22.3282 20.5978 22.6046 21.2304C22.881 21.863 23.6179 22.1518 24.2505 21.8754L23.75 20.7299L23.2495 19.5845ZM5.74954 21.8754C6.38215 22.1518 7.11904 21.863 7.39544 21.2304C7.67184 20.5978 7.38307 19.8609 6.75046 19.5845L6.25 20.7299L5.74954 21.8754ZM15 16.25H13.75L13.75 26.25H15H16.25L16.25 16.25H15ZM11.25 18.75L12.1339 19.6339L14.4697 17.2981L13.5858 16.4142L12.7019 15.5303L10.3661 17.8661L11.25 18.75ZM16.4142 16.4142L15.5303 17.2981L17.8661 19.6339L18.75 18.75L19.6339 17.8661L17.2981 15.5303L16.4142 16.4142ZM13.5858 16.4142L14.4697 17.2981C14.7318 17.036 14.8759 16.8933 14.9873 16.7986C15.0876 16.7135 15.0767 16.7428 15 16.7678L14.6137 15.5789L14.2275 14.3901C13.8653 14.5078 13.5879 14.7073 13.3694 14.8928C13.162 15.0689 12.9348 15.2974 12.7019 15.5303L13.5858 16.4142ZM16.4142 16.4142L17.2981 15.5303C17.0652 15.2974 16.838 15.0689 16.6306 14.8928C16.4121 14.7073 16.1347 14.5078 15.7725 14.3901L15.3863 15.5789L15 16.7678C14.9233 16.7428 14.9124 16.7135 15.0127 16.7987C15.1241 16.8933 15.2682 17.036 15.5303 17.2981L16.4142 16.4142ZM14.6137 15.5789L15 16.7678L15.3863 15.5789L15.7725 14.3901C15.2704 14.227 14.7296 14.227 14.2275 14.3901L14.6137 15.5789ZM22.492 8.87341L22.245 10.0987C24.5298 10.5594 26.25 12.5802 26.25 15H27.5H28.75C28.75 11.3667 26.1678 8.33938 22.7391 7.64807L22.492 8.87341ZM8.87341 7.50798L10.0987 7.75504C10.5594 5.47016 12.5802 3.75 15 3.75V2.5V1.25C11.3667 1.25 8.33938 3.83225 7.64807 7.26092L8.87341 7.50798ZM15 2.5V3.75C17.4198 3.75 19.4406 5.47016 19.9013 7.75504L21.1266 7.50798L22.3519 7.26092C21.6606 3.83225 18.6333 1.25 15 1.25V2.5ZM2.5 15H3.75C3.75 12.5802 5.47016 10.5594 7.75504 10.0987L7.50798 8.87341L7.26092 7.64807C3.83225 8.33938 1.25 11.3667 1.25 15H2.5ZM27.5 15H26.25C26.25 17.0484 25.0181 18.8118 23.2495 19.5845L23.75 20.7299L24.2505 21.8754C26.8967 20.7192 28.75 18.0774 28.75 15H27.5ZM6.25 20.7299L6.75046 19.5845C4.98195 18.8118 3.75 17.0484 3.75 15H2.5H1.25C1.25 18.0774 3.10329 20.7192 5.74954 21.8754L6.25 20.7299ZM8.87341 7.50798L7.64807 7.26092C7.61108 7.44438 7.44438 7.61108 7.26092 7.64807L7.50798 8.87341L7.75504 10.0987C8.92506 9.86284 9.86284 8.92506 10.0987 7.75504L8.87341 7.50798ZM22.492 8.87341L22.7391 7.64807C22.5556 7.61108 22.3889 7.44438 22.3519 7.26092L21.1266 7.50798L19.9013 7.75504C20.1372 8.92506 21.0749 9.86284 22.245 10.0987L22.492 8.87341Z" fill="#009728" />
          </svg>
        </span>
        <p className="text-sm font-medium text-gray-800">
          Select Your File Or Drag And Drop
        </p>
        <p className="text-xs text-gray-500 mb-4">
          PNG, PDF, JPG, JPEG, DOCX — Max {maxSizeMB}MB
        </p>

        <button
          type="button"
          className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 text-sm font-medium transition"
        >
          Browse
        </button>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".png,.jpg,.jpeg,.pdf,.docx"
          onChange={handleFileChange}
        />
      </div>

      {/* Preview (can be disabled via showInlinePreview) */}
      {showInlinePreview && file ? (
        <div className="mt-3 flex items-center justify-between bg-[#DDE2E5] rounded-3xl p-4 w-[25%]">
          <div className="flex items-center gap-3">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="w-12 h-12 rounded-lg object-cover border" />
            ) : (
              <FileText className="text-green-600" size={24} />
            )}
            <div className="text-sm text-primaryText truncate w-[80%]" title={file.name}>{file.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1 rounded-full text-green-600"
              title="Remove File"
            >
              <Trash2 className="cursor-pointer" size={20} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default FileUploadBox;
