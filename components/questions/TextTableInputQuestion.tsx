import { TextTableInputQuestion as TextTableInputQuestionType } from '@/types/question';

interface TextTableInputQuestionProps {
  question: TextTableInputQuestionType;
  value: string;
  onChange: (value: string) => void;
}

export default function TextTableInputQuestion({
  question,
  value,
  onChange,
}: TextTableInputQuestionProps) {
  const tableHeaders = Object.keys(question.tableData);
  const tableRows = question.tableData[tableHeaders[0]]?.length || 0;

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.text}</p>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: tableRows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {tableHeaders.map((header) => (
                  <td
                    key={header}
                    className="border border-gray-300 px-4 py-2"
                  >
                    {question.tableData[header][rowIndex]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          Ваш ответ:
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Введите ответ"
        />
      </div>
    </div>
  );
}
