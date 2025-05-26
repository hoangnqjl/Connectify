import classNames from "classnames/bind";
import styles from "../Auth.module.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoAt } from "react-icons/io5";
import { LuKeyRound } from "react-icons/lu";
import { AiOutlineUser } from "react-icons/ai";
import { IoCallOutline } from "react-icons/io5";
import authService from "@/services/authService";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";

const cx = classNames.bind(styles);

function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { setUser, user } = useUser();

   useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      if (token && !user) {
        // Nếu có token nhưng chưa có user, gọi getMe để lấy thông tin
        const userResult = await authService.getMe();
        if (userResult.success) {
          setUser(userResult.user);
          navigate("/", { replace: true });
        } else {
          // Nếu token không hợp lệ, xóa token
          localStorage.removeItem("token");
        }
      } else if (token && user) {
        // Nếu đã có token và user, chuyển hướng ngay
        navigate("/", { replace: true });
      }
    };

    checkAuth();
  }, [navigate, setUser, user]);
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const result = await authService.signup(email, fullname, phonenumber, password);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => navigate("/login"), 2000); // Chuyển về trang đăng nhập sau 2 giây
    } else {
      setError(result.error);
    }
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("content")}>
        <h1>Connectify</h1>
        <span>Sign up now use the website!</span>
        <form onSubmit={handleSignup}>
          <div className={cx("form-group")}>
            <div className={cx("form-group-icon")}>
              <IoAt className={cx("text-[20px]")} />
            </div>
            <input
              className={cx("form-input")}
              placeholder="email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={cx("form-group")}>
            <div className={cx("form-group-icon")}>
              <AiOutlineUser className={cx("text-[20px]")} />
            </div>
            <input
              className={cx("form-input")}
              placeholder="fullname..."
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>
          <div className={cx("form-group")}>
            <div className={cx("form-group-icon")}>
              <IoCallOutline className={cx("text-[20px]")} />
            </div>
            <input
              type="number"
              className={cx("form-input")}
              placeholder="phonenumber..."
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              required
            />
          </div>
          <div className={cx("form-group")}>
            <div className={cx("form-group-icon")}>
              <LuKeyRound className={cx("text-[20px]")} />
            </div>
            <input
              type="password"
              className={cx("form-input")}
              placeholder="password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div style={{ color: "red" }}>{error}</div>}
          {success && <div style={{ color: "green" }}>{success}</div>}
          <button className={cx("btn-submit")} type="submit">
            Sign up
          </button>
          <Link className={cx("btn-switch")} to="/login">
            Login an account!
          </Link>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;