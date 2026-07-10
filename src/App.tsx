import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";

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
import AdminContentSourcesPage from "./pages/admin/AdminContentSourcesPage";
import AdminExternalContentPage from "./pages/admin/AdminExternalContentPage";
import AdminReservationsPage from "./pages/admin/AdminReservationsPage";
import AdminPhotoCuratorPage from "./pages/admin/AdminPhotoCuratorPage";

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
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route
                path="content-sources"
                element={<AdminContentSourcesPage />}
              />
              <Route
                path="external-content"
                element={<AdminExternalContentPage />}
              />
              <Route path="reservations" element={<AdminReservationsPage />} />
              <Route
                path="photo-curator"
                element={<AdminPhotoCuratorPage />}
              />
            </Route>

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
