import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";

// Layouts (eager — always needed, small)
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import RoleGuard from "./components/admin/RoleGuard";

// Public pages — lazy loaded (각 페이지를 별도 청크로 분리)
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const SpacesPage = lazy(() => import("./pages/SpacesPage"));
const SpaceDetailPage = lazy(() => import("./pages/SpaceDetailPage"));
const ProgramsPage = lazy(() => import("./pages/ProgramsPage"));
const ProgramDetailPage = lazy(() => import("./pages/ProgramDetailPage"));
const WeddingPage = lazy(() => import("./pages/WeddingPage"));
const ArchivePage = lazy(() => import("./pages/ArchivePage"));
const ArchiveDetailPage = lazy(() => import("./pages/ArchiveDetailPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const MediaPage = lazy(() => import("./pages/MediaPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ReservationPage = lazy(() => import("./pages/ReservationPage"));

// Admin pages — lazy loaded (일반 방문자는 로드하지 않음)
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminSpacesPage = lazy(() => import("./pages/admin/AdminSpacesPage"));
const AdminProgramsPage = lazy(() => import("./pages/admin/AdminProgramsPage"));
const AdminArchivePage = lazy(() => import("./pages/admin/AdminArchivePage"));
const AdminBlogPage = lazy(() => import("./pages/admin/AdminBlogPage"));
const AdminMediaPage = lazy(() => import("./pages/admin/AdminMediaPage"));
const AdminInquiriesPage = lazy(
  () => import("./pages/admin/AdminInquiriesPage"),
);
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminOperatorSettingsPage = lazy(
  () => import("./pages/admin/AdminOperatorSettingsPage"),
);
const AdminContentSourcesPage = lazy(
  () => import("./pages/admin/AdminContentSourcesPage"),
);
const AdminExternalContentPage = lazy(
  () => import("./pages/admin/AdminExternalContentPage"),
);
const AdminExternalPage = lazy(
  () => import("./pages/admin/AdminExternalPage"),
);
const AdminReservationsPage = lazy(
  () => import("./pages/admin/AdminReservationsPage"),
);
const AdminPhotoCuratorPage = lazy(
  () => import("./pages/admin/AdminPhotoCuratorPage"),
);
const AdminPhotoProjectsPage = lazy(
  () => import("./pages/admin/AdminPhotoProjectsPage"),
);
const AdminPhotoAssetExplorerPage = lazy(
  () => import("./pages/admin/AdminPhotoAssetExplorerPage"),
);
const AdminHeroPage = lazy(() => import("./pages/admin/AdminHeroPage"));
const AdminAboutPage = lazy(() => import("./pages/admin/AdminAboutPage"));
const AdminSitePage = lazy(() => import("./pages/admin/AdminSitePage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminBrandPage = lazy(() => import("./pages/admin/AdminBrandPage"));
const AdminWeddingPage = lazy(() => import("./pages/admin/AdminWeddingPage"));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
          <p className="font-sans text-xs tracking-widest uppercase text-brand-muted">
            Loading
          </p>
        </div>
      </div>
    );
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <HelmetProvider>
      {/* ── Search Console verification (set via .env) ──────────────────── */}
      <Helmet>
        {import.meta.env.VITE_GOOGLE_SITE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={import.meta.env.VITE_GOOGLE_SITE_VERIFICATION}
          />
        )}
        {import.meta.env.VITE_NAVER_SITE_VERIFICATION && (
          <meta
            name="naver-site-verification"
            content={import.meta.env.VITE_NAVER_SITE_VERIFICATION}
          />
        )}
        {import.meta.env.VITE_BING_SITE_VERIFICATION && (
          <meta
            name="msvalidate.01"
            content={import.meta.env.VITE_BING_SITE_VERIFICATION}
          />
        )}
      </Helmet>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={null}>
              <Routes>
                {/* Public routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/spaces" element={<SpacesPage />} />
                  <Route path="/spaces/:slug" element={<SpaceDetailPage />} />
                  <Route path="/programs" element={<ProgramsPage />} />
                  <Route
                    path="/programs/:slug"
                    element={<ProgramDetailPage />}
                  />
                  <Route
                    path="/events"
                    element={<Navigate to="/wedding" replace />}
                  />
                  <Route path="/wedding" element={<WeddingPage />} />
                  <Route path="/archive" element={<ArchivePage />} />
                  <Route
                    path="/archive/:slug"
                    element={<ArchiveDetailPage />}
                  />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/media" element={<MediaPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/reservation" element={<ReservationPage />} />
                </Route>

                {/* Admin auth */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Admin CMS routes */}
                <Route
                  path="/admin"
                  element={
                    <RequireAuth>
                      <AdminLayout />
                    </RequireAuth>
                  }
                >
                  <Route
                    index
                    element={
                      <RoleGuard permission="dashboard">
                        <AdminDashboard />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="spaces"
                    element={
                      <RoleGuard permission="spaces">
                        <AdminSpacesPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="programs"
                    element={
                      <RoleGuard permission="programs">
                        <AdminProgramsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="archive"
                    element={
                      <RoleGuard permission="archive">
                        <AdminArchivePage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="blog"
                    element={
                      <RoleGuard permission="blog">
                        <AdminBlogPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="media"
                    element={
                      <RoleGuard permission="media">
                        <AdminMediaPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="inquiries"
                    element={
                      <RoleGuard permission="inquiries">
                        <AdminInquiriesPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="wedding"
                    element={
                      <RoleGuard permission="wedding_photos">
                        <AdminWeddingPage />
                      </RoleGuard>
                    }
                  />
                  {/* 운영 정보 — operator 이상 접근 가능 */}
                  <Route
                    path="operator-settings"
                    element={
                      <RoleGuard permission="operator_settings">
                        <AdminOperatorSettingsPage />
                      </RoleGuard>
                    }
                  />
                  {/* 이하 super_admin 전용 */}
                  <Route
                    path="settings"
                    element={
                      <RoleGuard permission="system_settings">
                        <AdminSettingsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="hero"
                    element={
                      <RoleGuard permission="hero">
                        <AdminHeroPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="brand"
                    element={
                      <RoleGuard permission="brand">
                        <AdminBrandPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="about"
                    element={
                      <RoleGuard permission="about">
                        <AdminAboutPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="site"
                    element={
                      <RoleGuard permission="hero">
                        <AdminSitePage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <RoleGuard permission="users">
                        <AdminUsersPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="content-sources"
                    element={
                      <RoleGuard permission="content_sources">
                        <AdminContentSourcesPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="external-content"
                    element={
                      <RoleGuard permission="external_content">
                        <AdminExternalContentPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="external"
                    element={
                      <RoleGuard permission="content_sources">
                        <AdminExternalPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="reservations"
                    element={
                      <RoleGuard permission="reservations">
                        <AdminReservationsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="photo-projects"
                    element={
                      <RoleGuard permission="photo_projects">
                        <AdminPhotoProjectsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="photo-projects/:projectId"
                    element={
                      <RoleGuard permission="photo_projects">
                        <AdminPhotoAssetExplorerPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="photo-curator"
                    element={
                      <RoleGuard permission="photo_curator">
                        <AdminPhotoCuratorPage />
                      </RoleGuard>
                    }
                  />
                </Route>

                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
