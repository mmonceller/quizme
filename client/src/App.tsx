import { Navigate, Route, Routes } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { GuestRoute, ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { AccountPage } from './features/account/AccountPage';
import { HomePage } from './features/library/HomePage';
import { GroupPage } from './features/library/GroupPage';
import { SharedPage } from './features/library/SharedPage';
import { QuizEditorPage } from './features/editor/QuizEditorPage';
import { PlayPage } from './features/player/pages/PlayPage';
import { PublicPlayPage } from './features/player/pages/PublicPlayPage';
import { ResponsesPage } from './features/results/ResponsesPage';
import { ResponseDetailPage } from './features/results/ResponseDetailPage';
import { VersionsPage } from './features/results/VersionsPage';

export function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/p/:token" element={<PublicPlayPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/groups/:groupId" element={<GroupPage />} />
          <Route path="/shared" element={<SharedPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/quizzes/:quizId/responses" element={<ResponsesPage />} />
          <Route path="/quizzes/:quizId/responses/:responseId" element={<ResponseDetailPage />} />
          <Route path="/quizzes/:quizId/versions" element={<VersionsPage />} />
        </Route>
        <Route path="/quizzes/:quizId/edit" element={<QuizEditorPage />} />
        <Route path="/quizzes/:quizId/play" element={<PlayPage mode="play" />} />
        <Route path="/quizzes/:quizId/present" element={<PlayPage mode="present" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
