/**
 * AdminQueryError
 * Admin 페이지 쿼리 실패 시 표시되는 공통 에러 UI.
 * isError 상태 + refetch 버튼을 제공합니다.
 */
interface AdminQueryErrorProps {
  onRetry?: () => void;
  message?: string;
}

export default function AdminQueryError({
  onRetry,
  message = "데이터를 불러오지 못했습니다.",
}: AdminQueryErrorProps) {
  return (
    <div className="text-center py-16 border border-dashed border-red-200">
      <p className="font-sans text-sm text-red-400 mb-3">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="font-sans text-xs text-gray-500 underline hover:text-gray-700"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
