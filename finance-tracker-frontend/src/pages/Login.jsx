import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/login/", {
        email,
        password,
      });

      // Save tokens
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      setMessage("✅ Login successful!");

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("❌ Login error:", error.response?.data);
      setMessage("❌ Invalid credentials or server error.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>

        {/* 👇 Register link added here */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>

        {message && (
          <p className="mt-4 text-center text-gray-700 font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
