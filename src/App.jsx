import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";

import PostTuition from "./pages/PostTuition.jsx";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import BecomeTutor from "./pages/BecomeTutor";
import FindTutors from "./pages/FindTutors.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ParentDashboard from "./pages/ParentDashboard.jsx";
import TutorDashboard from "./pages/TutorDashboard.jsx";
import TutorProfile from "./pages/TutorProfile.jsx";
import TuitionRequest from "./pages/TuitionRequest.jsx";
import TutorApplications from "./pages/TutorApplications.jsx";
import ParentApplications from "./pages/ParentApplications.jsx";
import CreateTutorProfile from "./pages/CreateTutorProfile.jsx";
import ParentWizard from "./pages/ParentWizard";
import TutorSignup from "./pages/TutorSignup";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTutors from "./pages/AdminTutors";
import AdminPosts from "./pages/AdminPosts";
import AdminApplications from "./pages/AdminApplications";
import AdminPlacements from "./pages/AdminPlacements";
import AdminPayments from "./pages/AdminPayments";
import AdminRevenue from "./pages/AdminRevenue";
import AdminReports from "./pages/AdminReports";
import AdminPlaceholder from "./pages/AdminPlaceholder";
import TutorPayment from "./pages/TutorPayment";
import TutorSchedule from "./pages/TutorSchedule";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/become-tutor" element={<BecomeTutor />} />
        <Route path="/parent/find-tutors" element={<FindTutors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
        <Route path="/tutor/dashboard" element={<TutorDashboard />} />
        <Route path="/tutor/profile/create" element={<CreateTutorProfile />} />
        <Route path="/parent/post-tuition" element={<PostTuition />} />
        <Route path="/tutor/:id" element={<TutorProfile />} />
        <Route path="/tutor/:id/request" element={<TuitionRequest />} />
        <Route path="/tutor/applications" element={<TutorApplications />} />
        <Route path="/parent/applications" element={<ParentApplications />} />
        <Route path="/parent/wizard" element={<ParentWizard />} />
        <Route path="/tutor/signup" element={<TutorSignup />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/tutors" element={<AdminTutors />} />
        <Route path="/admin/posts" element={<AdminPosts />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/placements" element={<AdminPlacements />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/revenue" element={<AdminRevenue />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/placements" element={<AdminPlaceholder />} />
        <Route path="/tutor/payment/:applicationId" element={<TutorPayment />} />
        <Route path="/tutor/schedule/:applicationId" element={<TutorSchedule />} />
      </Routes>
    </>
  );
}



function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
