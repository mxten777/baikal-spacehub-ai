import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "../common/AnimatedSection";

const collabTypes = [
  {
    icon: "🎨",
    title: "브랜드 이벤트",
    description:
      "론칭, 팝업스토어, 기업 행사 등 브랜드의 특별한 순간을 연출합니다.",
    link: "/contact?type=collaboration",
  },
  {
    icon: "📷",
    title: "촬영 대관",
    description:
      "광고, 영화, 화보 촬영을 위한 다양한 분위기의 공간을 제공합니다.",
    link: "/contact?type=rental",
  },
  {
    icon: "🏢",
    title: "기업 미팅 & 세미나",
    description:
      "소규모 워크샵부터 대형 컨퍼런스까지 맞춤형 공간 서비스를 제공합니다.",
    link: "/contact?type=collaboration",
  },
];

export default function CollaborationSection() {
  return (
    <section className="section-padding bg-brand-black relative overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container-wide relative">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <p className="eyebrow text-white/40 mb-4">Collaboration</p>
            <h2 className="font-display text-display font-light text-white mb-4">
              함께 만드는 특별한 경험
            </h2>
            <p className="font-sans text-base text-white/60 max-w-xl mx-auto">
              브랜드, 기업, 크리에이터와 함께 더릿만의 특별한 공간에서 잊을 수
              없는 경험을 만들어 드립니다.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
          {collabTypes.map((type, i) => (
            <AnimatedSection
              key={type.title}
              animation="fade-up"
              delay={i * 100}
            >
              <Link
                to={type.link}
                className="group block p-5 sm:p-8 border border-white/10 hover:border-brand-accent transition-colors duration-300"
              >
                <span className="text-3xl mb-4 block">{type.icon}</span>
                <h3 className="font-display text-xl font-light text-white mb-3 group-hover:text-brand-accent transition-colors">
                  {type.title}
                </h3>
                <p className="font-sans text-sm text-white/50 leading-relaxed">
                  {type.description}
                </p>
              </Link>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection animation="fade-up" delay={300}>
          <div className="text-center">
            <Link to="/contact" className="btn-accent">
              협업 문의하기 <ArrowRight size={16} />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
