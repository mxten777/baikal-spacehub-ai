import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  User,
  Phone,
  Mail,
  Building2,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { reservationsService } from "../../services/reservations";
import type { Reservation, ReservationStatus } from "../../types";
import AdminQueryError from "../../components/admin/AdminQueryError";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; color: string; bg: string }
> = {
  new: {
    label: "신규",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  consulting: {
    label: "상담중",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  quote_sent: {
    label: "견적 발송",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
  },
  confirmed: {
    label: "예약 확정",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  completed: {
    label: "행사 완료",
    color: "text-brand-muted",
    bg: "bg-brand-cream border-brand-border",
  },
  cancelled: {
    label: "취소",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
  },
};

const STATUS_ORDER: ReservationStatus[] = [
  "new",
  "consulting",
  "quote_sent",
  "confirmed",
  "completed",
  "cancelled",
];

const EVENT_TYPE_LABELS: Record<string, string> = {
  exhibition: "전시",
  performance: "공연",
  workshop: "워크숍",
  brand_event: "브랜드 행사",
  corporate: "기업행사",
  shoot: "촬영",
  wedding: "웨딩",
  gathering: "모임",
  consultation: "공간 상담",
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReservationStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex px-2 py-0.5 font-sans text-[10px] font-medium border ${cfg.bg} ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Reservation Row / Detail ─────────────────────────────────────────────────

function ReservationRow({
  r,
  onStatusChange,
}: {
  r: Reservation;
  onStatusChange: (id: string, status: ReservationStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  return (
    <div className="border border-brand-line">
      {/* Summary row */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-brand-ivory transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <ChevronDown
          size={14}
          className={`shrink-0 text-brand-subtle transition-transform ${expanded ? "rotate-180" : ""}`}
        />
        <div className="flex-1 grid grid-cols-5 gap-4 items-center min-w-0">
          <div className="col-span-2 min-w-0">
            <p className="font-sans text-sm font-medium text-brand-black truncate">
              {r.name}
            </p>
            <p className="font-sans text-xs text-brand-subtle truncate">
              {r.phone}
            </p>
          </div>
          <div>
            <span className="font-sans text-xs text-brand-muted bg-brand-cream px-2 py-0.5 border border-brand-line">
              {EVENT_TYPE_LABELS[r.event_type] || r.event_type}
            </span>
          </div>
          <div>
            <StatusBadge status={r.status} />
          </div>
          <div className="text-right">
            <p className="font-sans text-[10px] text-brand-subtle">
              {format(new Date(r.created_at), "MM.dd HH:mm")}
            </p>
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-brand-line bg-brand-ivory px-5 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Contact */}
            <div className="space-y-2">
              <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-3">
                연락처
              </p>
              <div className="flex items-center gap-2 text-xs text-brand-black">
                <User size={12} className="text-brand-muted shrink-0" />{" "}
                {r.name}
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-black">
                <Phone size={12} className="text-brand-muted shrink-0" />
                <a href={`tel:${r.phone}`} className="hover:underline">
                  {r.phone}
                </a>
              </div>
              {r.email && (
                <div className="flex items-center gap-2 text-xs text-brand-black">
                  <Mail size={12} className="text-brand-muted shrink-0" />
                  <a
                    href={`mailto:${r.email}`}
                    className="hover:underline truncate"
                  >
                    {r.email}
                  </a>
                </div>
              )}
              {r.company && (
                <div className="flex items-center gap-2 text-xs text-brand-black">
                  <Building2 size={12} className="text-brand-muted shrink-0" />{" "}
                  {r.company}
                </div>
              )}
            </div>

            {/* Event details */}
            <div className="space-y-2">
              <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-3">
                행사 정보
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted">유형</span>
                <span className="text-brand-black">
                  {EVENT_TYPE_LABELS[r.event_type]}
                </span>
              </div>
              {r.preferred_date && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-muted">희망 날짜</span>
                  <span className="text-brand-black flex items-center gap-1">
                    <Calendar size={10} />
                    {r.preferred_date}
                    {r.date_flexible && (
                      <span className="text-brand-subtle">(유동)</span>
                    )}
                  </span>
                </div>
              )}
              {r.expected_attendees && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-muted">예상 인원</span>
                  <span className="text-brand-black">
                    {r.expected_attendees}명
                  </span>
                </div>
              )}
              {r.recommended_space && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-muted">추천 공간</span>
                  <span className="text-brand-black">
                    {r.recommended_space}
                  </span>
                </div>
              )}
              {r.budget_range && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-muted">예산</span>
                  <span className="text-brand-black">{r.budget_range}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-3">
                메모
              </p>
              {r.event_purpose && (
                <p className="font-sans text-xs text-brand-black mb-2 leading-relaxed">
                  <span className="text-brand-muted">목적: </span>
                  {r.event_purpose}
                </p>
              )}
              {r.notes && (
                <p className="font-sans text-xs text-brand-black leading-relaxed">
                  <span className="text-brand-muted">요청: </span>
                  {r.notes}
                </p>
              )}
              {!r.event_purpose && !r.notes && (
                <p className="font-sans text-xs text-brand-subtle italic">
                  메모 없음
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
            {/* Status change */}
            <div className="relative">
              <button
                onClick={() => setStatusOpen((o) => !o)}
                className="flex items-center gap-2 px-4 py-2 border border-brand-border font-sans text-[10px] tracking-widest uppercase text-brand-black hover:border-brand-black transition-colors"
              >
                상태 변경 <ChevronDown size={11} />
              </button>
              {statusOpen && (
                <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-brand-border shadow-lg z-10">
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        onStatusChange(r.id, s);
                        setStatusOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 font-sans text-xs hover:bg-brand-cream transition-colors ${r.status === s ? "text-brand-black font-medium" : "text-brand-muted"}`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a
              href={`mailto:${r.email}?subject=더릿 공간 예약 안내 — ${EVENT_TYPE_LABELS[r.event_type]}`}
              className="flex items-center gap-2 px-4 py-2 border border-brand-border font-sans text-[10px] tracking-widest uppercase text-brand-muted hover:text-brand-black hover:border-brand-black transition-colors"
            >
              <ExternalLink size={11} /> 이메일 회신
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminReservationsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">(
    "all",
  );

  const { data: reservations = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-reservations"],
    queryFn: () => reservationsService.getAll(),
  });

  const handleStatusChange = async (id: string, status: ReservationStatus) => {
    try {
      await reservationsService.updateStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
    } catch {
      alert("상태 변경에 실패했습니다.");
    }
  };

  const filtered =
    statusFilter === "all"
      ? reservations
      : reservations.filter((r) => r.status === statusFilter);

  // Stats
  const stats = STATUS_ORDER.reduce(
    (acc, s) => {
      acc[s] = reservations.filter((r) => r.status === s).length;
      return acc;
    },
    {} as Record<ReservationStatus, number>,
  );

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-light text-brand-black mb-1">
          예약 관리
        </h1>
        <p className="font-sans text-sm text-brand-muted">
          공간 예약 요청 및 CRM 상태 관리
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {STATUS_ORDER.map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`p-3 text-left border transition-all ${
                statusFilter === s
                  ? "border-brand-black"
                  : "border-brand-line hover:border-brand-border"
              }`}
            >
              <p className="font-display text-2xl font-light text-brand-black">
                {stats[s] || 0}
              </p>
              <p
                className={`font-sans text-[9px] tracking-[0.15em] uppercase mt-0.5 ${cfg.color}`}
              >
                {cfg.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-sans text-xs text-brand-muted">
          {statusFilter === "all"
            ? `전체 ${reservations.length}건`
            : `${STATUS_CONFIG[statusFilter].label} ${filtered.length}건`}
        </p>
        {statusFilter !== "all" && (
          <button
            onClick={() => setStatusFilter("all")}
            className="font-sans text-[10px] tracking-widest uppercase text-brand-subtle hover:text-brand-black transition-colors"
          >
            필터 해제
          </button>
        )}
      </div>

      {/* Reservations list */}
      {isLoading ? (
        <div className="py-16 text-center font-sans text-sm text-brand-muted">
          불러오는 중...
        </div>
      ) : isError ? (
        <AdminQueryError onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border border-brand-line">
          <p className="font-display text-lg font-light text-brand-muted">
            예약 요청이 없습니다
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <ReservationRow
              key={r.id}
              r={r}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
