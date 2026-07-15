import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { AuthProvider } from "./contexts/AuthContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import SpacesPage from "./pages/SpacesPage";
import SpaceDetailPage from "./pages/SpaceDetailPage";
import ProgramsPage from "./pages/ProgramsPage";
import ProgramDetailPage from "./pages/ProgramDetailPage";
import ArchivePage from "./pages/ArchivePage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import MediaPage from "./pages/MediaPage";
import ContactPage from "./pages/ContactPage";
import ReservationPage from "./pages/ReservationPage";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSpacesPage from "./pages/admin/AdminSpacesPage";
import AdminProgramsPage from "./pages/admin/AdminProgramsPage";
import AdminArchivePage from "./pages/admin/AdminArchivePage";
import AdminBlogPage from "./pages/admin/AdminBlogPage";
import AdminMediaPage from "./pages/admin/AdminMediaPage";
import AdminInquiriesPage from "./pages/admin/AdminInquiriesPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminOperatorSettingsPage from "./pages/admin/AdminOperatorSettingsPage";
import AdminContentSourcesPage from "./pages/admin/AdminContentSourcesPage";
import AdminExternalContentPage from "./pages/admin/AdminExternalContentPage";
import AdminReservationsPage from "./pages/admin/AdminReservationsPage";
import AdminPhotoCuratorPage from "./pages/admin/AdminPhotoCuratorPage";
import AdminPhotoProjectsPage from "./pages/admin/AdminPhotoProjectsPage";
import AdminPhotoAssetExplorerPage from "./pages/admin/AdminPhotoAssetExplorerPage";
import AdminHeroPage from "./pages/admin/AdminHeroPage";
import AdminAboutPage from "./pages/admin/AdminAboutPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import RoleGuard from "./components/admin/RoleGuard";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: false,
    },
  },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;
  if (!session) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/spaces" element={<SpacesPage />} />
              <Route path="/spaces/:slug" element={<SpaceDetailPage />} />
              <Route path="/programs" element={<ProgramsPage />} />
              <Route path="/programs/:slug" element={<ProgramDetailPage />} />
              <Route
                path="/events"
                element={<Navigate to="/programs" replace />}
              />
              <Route path="/archive" element={<ArchivePage />} />
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
              <Route index element={<AdminDashboard />} />
              <Route path="spaces" element={<AdminSpacesPage />} />
              <Route path="programs" element={<AdminProgramsPage />} />
              <Route path="archive" element={<AdminArchivePage />} />
              <Route path="blog" element={<AdminBlogPage />} />
              <Route path="media" element={<AdminMediaPage />} />
              <Route path="inquiries" element={<AdminInquiriesPage />} />
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
                path="about"
                element={
                  <RoleGuard permission="about">
                    <AdminAboutPage />
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
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
