import { useState } from "react";
import { useInquiries } from "../../hooks/useData";
import { inquiriesService } from "../../services/inquiries";
import type { Inquiry } from "../../types";
import type { InquiryStatus } from "../../types";
import { useQueryClient } from "@tanstack/react-query";
import { X, ChevronDown, Loader2, Mail, Phone, Clock } from "lucide-react";
import AdminQueryError from "../../components/admin/AdminQueryError";

const STATUS_LABELS: Record<string, string> = {
  pending: "대기 중",
  reviewing: "검토 중",
  replied: "답변 완료",
  closed: "종료",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  reviewing: "bg-blue-100 text-blue-700",
  replied: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-500",
};

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  rental: "공간 대여",
  collaboration: "협력 제안",
  general: "일반 문의",
  media: "취재/언론",
  wedding: "웨딩 상담",
};

function InquiryModal({
  inquiry,
  onClose,
  onStatusChange,
}: {
  inquiry: Inquiry;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await onStatusChange(inquiry.id, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="font-display text-lg font-light">
              {inquiry.subject}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase ${STATUS_COLORS[inquiry.status] ?? "bg-gray-100"}`}
              >
                {STATUS_LABELS[inquiry.status] ?? inquiry.status}
              </span>
              <span className="text-xs font-sans text-gray-400">
                {INQUIRY_TYPE_LABELS[inquiry.inquiry_type] ??
                  inquiry.inquiry_type}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Sender info */}
          <div className="bg-gray-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-sans text-gray-700">
              <span className="font-medium">{inquiry.name}</span>
            </div>
            {inquiry.email && (
              <div className="flex items-center gap-2 text-sm font-sans text-gray-600">
                <Mail size={14} className="text-gray-400" />
                <a
                  href={`mailto:${inquiry.email}`}
                  className="hover:text-brand-black"
                >
                  {inquiry.email}
                </a>
              </div>
            )}
            {inquiry.phone && (
              <div className="flex items-center gap-2 text-sm font-sans text-gray-600">
                <Phone size={14} className="text-gray-400" />
                {inquiry.phone}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs font-sans text-gray-400">
              <Clock size={12} />
              {new Date(inquiry.created_at).toLocaleString("ko-KR")}
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs font-sans text-gray-500 tracking-wider uppercase mb-2">
              메시지
            </p>
            <p className="text-sm font-sans text-gray-700 whitespace-pre-wrap leading-relaxed">
              {inquiry.message}
            </p>
          </div>

          {/* Status change */}
          <div>
            <p className="text-xs font-sans text-gray-500 tracking-wider uppercase mb-2">
              상태 변경
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => handleStatusChange(val)}
                  disabled={updatingStatus || inquiry.status === val}
                  className={`px-4 py-1.5 text-xs font-sans tracking-wider uppercase transition-colors disabled:opacity-40 ${
                    inquiry.status === val
                      ? "bg-brand-black text-white"
                      : "border border-gray-200 text-gray-600 hover:border-brand-black hover:text-brand-black"
                  }`}
                >
                  {updatingStatus && inquiry.status !== val ? (
                    <Loader2 size={10} className="animate-spin inline mr-1" />
                  ) : null}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminInquiriesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const {
    data: inquiries,
    isLoading,
    isError,
    refetch,
  } = useInquiries(statusFilter === "all" ? {} : { status: statusFilter });
  const queryClient = useQueryClient();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const handleStatusChange = async (id: string, status: string) => {
    await inquiriesService.updateStatus(id, status as InquiryStatus);
    queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    if (selectedInquiry?.id === id) {
      setSelectedInquiry((prev) =>
        prev ? { ...prev, status: status as InquiryStatus } : prev,
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-light text-brand-black">
            Inquiries
          </h1>
          <p className="font-sans text-sm text-gray-500 mt-1">문의 관리</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { val: "all", label: "전체" },
          ...Object.entries(STATUS_LABELS).map(([val, label]) => ({
            val,
            label,
          })),
        ].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setStatusFilter(val)}
            className={`px-4 py-1.5 text-xs font-sans tracking-wider uppercase transition-colors ${
              statusFilter === val
                ? "bg-brand-black text-white"
                : "border border-gray-200 text-gray-600 hover:border-brand-black"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isError ? (
        <AdminQueryError onRetry={refetch} />
      ) : (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase">
                  이름
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase">
                  제목
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden md:table-cell">
                  유형
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden lg:table-cell">
                  날짜
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden md:table-cell">
                  상태
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td colSpan={99} className="px-6 py-4">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    </td>
                  </tr>
                ))
              ) : inquiries && inquiries.length > 0 ? (
                inquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedInquiry(inq)}
                  >
                    <td className="px-6 py-4">
                      <p className="font-sans text-sm font-medium text-brand-black">
                        {inq.name}
                      </p>
                      {inq.email && (
                        <p className="font-sans text-xs text-gray-400">
                          {inq.email}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-sans text-sm text-gray-700 line-clamp-1">
                        {inq.subject}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs font-sans text-gray-600">
                        {INQUIRY_TYPE_LABELS[inq.inquiry_type] ??
                          inq.inquiry_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs font-sans text-gray-600">
                        {new Date(inq.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase ${STATUS_COLORS[inq.status] ?? "bg-gray-100"}`}
                      >
                        {STATUS_LABELS[inq.status] ?? inq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ChevronDown
                        size={14}
                        className="text-gray-400 -rotate-90"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center font-sans text-sm text-gray-400"
                  >
                    문의가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedInquiry && (
        <InquiryModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
