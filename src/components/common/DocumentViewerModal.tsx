"use client"
import React from 'react'
import { X, Download, FileText } from 'lucide-react'

interface DocumentViewerModalProps {
    isOpen: boolean
    onClose: () => void
    document: {
        name: string
        url: string
        size?: number
        file?: File
    } | null
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, document }) => {
    if (!isOpen || !document) return null

    const getFileExtension = (filename: string) => {
        return filename.split('.').pop()?.toLowerCase() || ''
    }

    const isImage = (filename: string) => {
        const ext = getFileExtension(filename)
        return ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)
    }

    const isPDF = (filename: string) => {
        return getFileExtension(filename) === 'pdf'
    }

    const handleDownload = () => {
        if (!document) return
        const link = window.document.createElement('a')
        link.href = document.url
        link.download = document.name
        link.click()
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <FileText className="text-green-600" size={24} />
                        <div>
                            <h2 className="text-lg font-semibold text-primaryText">{document.name}</h2>
                            {document.size && (
                                <p className="text-sm text-gray-500">
                                    {(document.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-full hover:bg-gray-100 text-green-600 transition-colors"
                            title="Download"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 bg-gray-50">
                    {isImage(document.name) ? (
                        <div className="flex items-center justify-center h-full">
                            <img
                                src={document.url}
                                alt={document.name}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                            />
                        </div>
                    ) : isPDF(document.name) ? (
                        <iframe
                            src={document.url}
                            className="w-full h-full min-h-[600px] rounded-lg shadow-lg"
                            title={document.name}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <FileText className="text-gray-400 mb-4" size={64} />
                            <p className="text-gray-600 mb-2">Preview not available for this file type</p>
                            <p className="text-sm text-gray-500 mb-4">
                                File type: {getFileExtension(document.name).toUpperCase()}
                            </p>
                            <button
                                onClick={handleDownload}
                                className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <Download size={18} />
                                Download File
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DocumentViewerModal
