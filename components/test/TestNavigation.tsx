interface TestNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canGoNext: boolean;
}

export default function TestNavigation({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  canGoNext,
}: TestNavigationProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={onPrevious}
        disabled={isFirst}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          isFirst
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        ← Назад
      </button>
      {isLast ? (
        <button
          onClick={onSubmit}
          disabled={!canGoNext}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            canGoNext
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Завершить тест
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            canGoNext
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Далее →
        </button>
      )}
    </div>
  );
}
