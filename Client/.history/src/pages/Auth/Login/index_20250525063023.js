import classNames from "classnames/bind";
import styles from "../Auth.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoAt } from "react-icons/io5";
import { LuKeyRound } from "react-icons/lu";
import authService from "@/services/authService";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";

const cx = classNames.bind(styles);

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const result = await authService.login(email, password);

    if (result.success) {
      // Fetch user info after successful login
      const userResult = await authService.getMe();
      if (userResult.success) {
        setUser(userResult.user);
      }
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("content")}>
        <h1>Connectify</h1>
        <span>
          Welcome to Connectify Store – Your Trusted Marketplace for Pre-Loved Items!
        </span>
        <form onSubmit={handleLogin}>
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
          <button className={cx("btn-submit")} type="submit">
            Login
          </button>
          <Link className={cx("btn-switch")} to="/signup">
            Sign up an account for free!
          </Link>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;