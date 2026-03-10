import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, MapPin, Phone, Mail, Clock } from 'lucide-react'
import { inquiriesService } from '../services/inquiries'
import AnimatedSection from '../components/common/AnimatedSection'
import type { InquiryType } from '../types'

const schema = z.object({
  type: z.enum(['rental', 'collaboration', 'general', 'media']),
  name: z.string().min(2, '이름을 입력해 주세요'),
  email: z.string().email('올바른 이메일을 입력해 주세요'),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(3, '제목을 입력해 주세요'),
  message: z.string().min(10, '내용을 10자 이상 입력해 주세요'),
  preferred_date: z.string().optional(),
  expected_attendees: z.number().int().positive().optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

const INQUIRY_TYPES: { value: InquiryType; label: string }[] = [
  { value: 'rental', label: '공간 대관' },
  { value: 'collaboration', label: '협업 문의' },
  { value: 'general', label: '일반 문의' },
  { value: 'media', label: '미디어 / 취재' },
]

export default function ContactPage() {
  const [searchParams] = useSearchParams()
  const defaultType = (searchParams.get('type') as InquiryType) ?? 'general'
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: defaultType },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      await inquiriesService.submit({
        inquiry_type: data.type,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company,
        subject: data.subject,
        message: data.message,
        preferred_date: data.preferred_date || undefined,
        expected_attendees: data.expected_attendees ? Number(data.expected_attendees) : undefined,
      })
      setSubmitted(true)
      reset()
    } catch {
      alert('문의 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact — The Lit</title>
        <meta name="description" content="더릿에 문의하세요. 공간 대관, 협업, 일반 문의를 받고 있습니다." />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-12 bg-brand-white">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-4">Contact</p>
            <h1 className="font-display text-display font-light text-brand-black">
              문의하기
            </h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-padding bg-brand-white pt-0">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-2">
              <AnimatedSection animation="fade-up">
                {submitted ? (
                  <div className="py-16 text-center">
                    <CheckCircle2 size={48} className="text-brand-accent mx-auto mb-4" />
                    <h2 className="font-display text-2xl font-light text-brand-black mb-2">
                      문의가 접수되었습니다
                    </h2>
                    <p className="font-sans text-sm text-brand-muted">
                      빠른 시일 내로 담당자가 연락드리겠습니다.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-secondary mt-6"
                    >
                      다시 문의하기
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Inquiry type */}
                    <div>
                      <label className="form-label">문의 유형 *</label>
                      <div className="flex flex-wrap gap-3 mt-3">
                        {INQUIRY_TYPES.map((t) => (
                          <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value={t.value}
                              {...register('type')}
                              className="sr-only"
                            />
                            <span className="px-5 py-2.5 border border-brand-border font-sans text-xs font-medium tracking-widest uppercase transition-all duration-200 cursor-pointer peer-checked:bg-brand-black peer-checked:text-white hover:border-brand-black has-[:checked]:bg-brand-black has-[:checked]:text-white">
                              {t.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <label className="form-label">이름 *</label>
                        <input {...register('name')} className="form-input" placeholder="홍길동" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label className="form-label">이메일 *</label>
                        <input {...register('email')} type="email" className="form-input" placeholder="hello@example.com" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <label className="form-label">연락처</label>
                        <input {...register('phone')} className="form-input" placeholder="010-0000-0000" />
                      </div>
                      <div>
                        <label className="form-label">회사 / 단체명</label>
                        <input {...register('company')} className="form-input" placeholder="선택 사항" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <label className="form-label">희망 날짜</label>
                        <input {...register('preferred_date')} type="date" className="form-input" />
                      </div>
                      <div>
                        <label className="form-label">예상 인원</label>
                        <input {...register('expected_attendees', { valueAsNumber: true })} type="number" className="form-input" placeholder="명" />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">제목 *</label>
                      <input {...register('subject')} className="form-input" placeholder="문의 제목을 입력해 주세요" />
                      {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                    </div>

                    <div>
                      <label className="form-label">내용 *</label>
                      <textarea
                        {...register('message')}
                        rows={5}
                        className="form-input resize-none"
                        placeholder="문의 내용을 자세히 입력해 주세요"
                      />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? '전송 중...' : '문의 보내기'}
                    </button>
                  </form>
                )}
              </AnimatedSection>
            </div>

            {/* Contact info */}
            <div className="lg:col-span-1">
              <AnimatedSection animation="fade-up" delay={150}>
                <div className="space-y-8">
                  <div>
                    <h3 className="font-display text-xl font-light text-brand-black mb-5">찾아오시는 방법</h3>
                    <ul className="space-y-5">
                      <li className="flex items-start gap-3">
                        <MapPin size={15} className="text-brand-accent mt-0.5 shrink-0" />
                        <div>
                          <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">주소</p>
                          <p className="font-sans text-sm text-brand-black">서울특별시 마포구 연남동 000-00</p>
                          <p className="font-sans text-xs text-brand-muted mt-1">지하철 2호선 홍대입구역 3번 출구 도보 5분</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Clock size={15} className="text-brand-accent mt-0.5 shrink-0" />
                        <div>
                          <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">운영 시간</p>
                          <p className="font-sans text-sm text-brand-black">화 — 일: 11:00 — 21:00</p>
                          <p className="font-sans text-xs text-brand-muted mt-1">월요일 휴관</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Phone size={15} className="text-brand-accent mt-0.5 shrink-0" />
                        <div>
                          <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">전화</p>
                          <a href="tel:0200000000" className="font-sans text-sm text-brand-black hover:text-brand-accent transition-colors">02-0000-0000</a>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Mail size={15} className="text-brand-accent mt-0.5 shrink-0" />
                        <div>
                          <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">이메일</p>
                          <a href="mailto:hello@thelit.kr" className="font-sans text-sm text-brand-black hover:text-brand-accent transition-colors">hello@thelit.kr</a>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Map */}
                  <div className="aspect-square bg-brand-warm">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3163!2d126.924!3d37.557!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2zMzfCsDMz!5e0!3m2!1sko!2skr!4v1"
                      width="100%"
                      height="100%"
                      className="border-0 grayscale"
                      allowFullScreen
                      loading="lazy"
                      title="The Lit 지도"
                    />
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
