import { Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes, adminRoutes } from "./routes";
import MainLayout from "@/layout/MainLayout";
import PrivateRoute from "@/routes/PrivateRoute";
import AdminRoute from "@/routes/AdminRoute";
import { useUser } from "./contexts/UserContext";
import { useEffect } from "react";
import authService from "./services/authService";

function App() {
    const { setUser } = useUser();
    useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      (async () => {
        const res = await authService.getMe();
        if (res.success) {
          setUser(res.user);
        } else {
          console.warn("Lỗi lấy thông tin người dùng:", res.message);
          localStorage.removeItem('token');
          setUser(null);
        }
      })();
    }
  }, [setUser]);
  return (
    <Routes>
      {publicRoutes.map(({ path, component: Component, layout }, index) => {
        let Layout;

        if (layout === null) {
          Layout = ({ children }) => <>{children}</>;
        } else if (layout) {
          Layout = layout;
        } else {
          Layout = MainLayout;
        }

        return (
          <Route
            key={index}
            path={path}
            element={
              <Layout>
                <Component />
              </Layout>
            }
          />
        );
      })}

      {privateRoutes.map(({ path, component: Component, layout }, index) => {
        let Layout = layout || MainLayout;

        return (
          <Route
            key={index}
            path={path}
            element={
              <PrivateRoute>
                <Layout>
                  <Component />
                </Layout>
              </PrivateRoute>
            }
          />
        );
      })}

      <Route
        path="*"
        element={
          <MainLayout>
            <div>Trang không tồn tại (404)</div>
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default App;