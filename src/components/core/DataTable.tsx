import React from 'react';
import { ChapterConfig } from '../../engine/types';

interface DataTableProps {
  chapter: ChapterConfig;
}

const DataTable: React.FC<DataTableProps> = ({ chapter }) => {
  if (!chapter.dataRows || chapter.dataRows.length === 0) {
    return <p className="text-slate-500">No table data configured for this chapter.</p>;
  }

  const headers = Object.keys(chapter.dataRows[0]);

  return (
    <div>
      <h3 className="text-base font-semibold text-slate-900">Data table</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} className="pb-3 pr-4 font-medium text-slate-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chapter.dataRows.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-slate-50' : ''}>
                {headers.map((header) => (
                  <td key={header} className="px-2 py-3">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
