import React from 'react';

interface TableShimmerProps {
    rows?: number;
    columns?: number;
}

const TableShimmer: React.FC<TableShimmerProps> = ({ rows = 10, columns = 8 }) => {
    return (
        <div className="animate-pulse">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className={`flex gap-4 px-4 py-3 border-b border-gray-100 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className={`h-4 bg-gray-200 rounded ${colIndex === 0 ? 'w-12' : colIndex === columns - 1 ? 'w-24' : 'flex-1'
                                }`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default TableShimmer;
