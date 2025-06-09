import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PersonelBilgileri from './pages/PersonelBilgileri';
import TayinTaleplerim from './pages/TayinTaleplerim';
import YeniTalepForm from './pages/YeniTalepForm';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import Layout from './components/common/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout>
                <AdminPanel />
              </Layout>
            </AdminRoute>
          }
        />

        <Route
          path="/personel-bilgileri"
          element={
            <PrivateRoute>
              <Layout>
                <PersonelBilgileri />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/tayin-taleplerim"
          element={
            <PrivateRoute>
              <Layout>
                <TayinTaleplerim />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/yeni-talep"
          element={
            <PrivateRoute>
              <Layout>
                <YeniTalepForm />
              </Layout>
            </PrivateRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;