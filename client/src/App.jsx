import { Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import CourseList from './pages/Course/CourseList.jsx';
import CourseDetail from './pages/Course/CourseDetail.jsx';
import TopicsOverview from './pages/Course/TopicsOverview.jsx';
import MyLearning from './pages/Course/MyLearning.jsx';
import WeekDetail from './pages/Week/WeekDetail.jsx';
import LessonPage from './pages/Lesson/LessonPage.jsx';
import QuizPage from './pages/Quiz/QuizPage.jsx';
import QuizResultPage from './pages/Quiz/QuizResultPage.jsx';
import ProgressPage from './pages/Progress/ProgressPage.jsx';
import Profile from './pages/Profile/Profile.jsx';
import Privacy from './pages/Legal/Privacy.jsx';
import Terms from './pages/Legal/Terms.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminDashboard from './pages/Admin/Dashboard.jsx';
import AdminCourses from './pages/Admin/Courses.jsx';
import AdminDocuments from './pages/Admin/Documents.jsx';
import AdminContentReview from './pages/Admin/ContentReview.jsx';
import AdminWeeks from './pages/Admin/Weeks.jsx';
import AdminTopics from './pages/Admin/Topics.jsx';
import AdminLessons from './pages/Admin/Lessons.jsx';
import AdminExercises from './pages/Admin/Exercises.jsx';
import AdminQuizzes from './pages/Admin/Quizzes.jsx';
import AdminQuestions from './pages/Admin/Questions.jsx';
import AdminStudents from './pages/Admin/Students.jsx';
import ProgressAdmin from './pages/Admin/ProgressAdmin.jsx';
import Analytics from './pages/Admin/Analytics.jsx';
import Settings from './pages/Admin/Settings.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public + student site */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/courses/:id/topics" element={<TopicsOverview />} />
        <Route path="/courses/:courseId/weeks/:weekId" element={<WeekDetail />} />
        <Route path="/lessons/:id" element={<LessonPage />} />
        <Route path="/quizzes/:id" element={<QuizPage />} />
        <Route path="/quizzes/:id/results" element={<QuizResultPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/my-learning" element={<MyLearning />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="content-review" element={<AdminContentReview />} />
          <Route path="content-review/:docId" element={<AdminContentReview />} />
          <Route path="weeks" element={<AdminWeeks />} />
          <Route path="topics" element={<AdminTopics />} />
          <Route path="lessons" element={<AdminLessons />} />
          <Route path="exercises" element={<AdminExercises />} />
          <Route path="quizzes" element={<AdminQuizzes />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="progress" element={<ProgressAdmin />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
