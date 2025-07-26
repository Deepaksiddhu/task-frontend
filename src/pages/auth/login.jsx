import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
      navigate("/"); // redirect to dashboard
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <form onSubmit={handleSubmit} className="card-body">
          <h2 className="text-center text-2xl font-bold">Login</h2>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="form-control">
            <label className="label">Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              className="input input-bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input input-bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </div>
          
          <p className="text-sm text-center mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="link link-primary">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
