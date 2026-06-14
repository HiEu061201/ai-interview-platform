import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardPage from './pages/DashboardPage';
import InterviewSetupPage from './pages/InterviewSetupPage';
import InterviewRoomPage from './pages/InterviewRoomPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedbackPage from './pages/FeedbackPage';
import ProfilePage from './pages/ProfilePage';
import JobsPage from './pages/JobsPage';
import PrivateRoute from './components/PrivateRoute';
import CompaniesPage from './pages/CompaniesPage';
import CompanyQuestionsPage from './pages/CompanyQuestionsPage';
import StudyMaterialsPage from './pages/StudyMaterialsPage';
import { InterviewNotesPage } from './pages/InterviewNotesPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes */}

        <Route element={<PrivateRoute />}>
          {/* Dashboard Routes */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="interviews/new" element={<InterviewSetupPage />} />
            <Route path="interviews/:id/report" element={<FeedbackPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="companies/:company" element={<CompanyQuestionsPage />} />
            <Route path="study" element={<StudyMaterialsPage />} />
            <Route path="study/notes" element={<InterviewNotesPage />} />
            <Route path="study/:categorySlug" element={<StudyMaterialsPage />} />
            <Route path="study/:categorySlug/:materialSlug" element={<StudyMaterialsPage />} />
          </Route>
          
          {/* Full screen for Interview Room */}
          <Route path="/interviews/:id" element={<InterviewRoomPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
