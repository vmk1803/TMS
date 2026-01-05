// Hook to manage file uploads separately from Redux to avoid serialization issues
import { useState, useCallback } from 'react'

// Global file storage to persist across component re-renders and be accessible from parent
const globalFileMap = new Map<string, File>()

export function useFileUploadManager() {
    const [, forceUpdate] = useState({})

    const addFile = useCallback((id: string, file: File) => {
        globalFileMap.set(id, file)
        forceUpdate({}) // Trigger re-render
    }, [])

    const removeFile = useCallback((id: string) => {
        globalFileMap.delete(id)
        forceUpdate({}) // Trigger re-render
    }, [])

    const getFile = useCallback((id: string): File | undefined => {
        return globalFileMap.get(id)
    }, [])

    const getAllFiles = useCallback((): Map<string, File> => {
        return new Map(globalFileMap)
    }, [])

    const clearAllFiles = useCallback(() => {
        globalFileMap.clear()
        forceUpdate({}) // Trigger re-render
    }, [])

    return {
        addFile,
        removeFile,
        getFile,
        getAllFiles,
        clearAllFiles,
    }
}

// Export function to get files from anywhere (for use in page.tsx)
export function getUploadedFiles(): Map<string, File> {
    return new Map(globalFileMap)
}

export function clearUploadedFiles(): void {
    globalFileMap.clear()
}
