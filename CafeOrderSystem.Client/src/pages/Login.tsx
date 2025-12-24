import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== handleSubmit called ===");
    setError(null);

    // Validation
    if (!formData.username || !formData.password) {
      console.log("Validation failed - empty fields");
      setError("Please fill in all fields");
      return;
    }

    console.log("Starting login process...");
    setLoading(true);

    try {
      console.log("About to call login API...");
      const response = await login({
        username: formData.username,
        password: formData.password,
      });
      console.log("Login response:", response);
      console.log("response.success:", response.success);
      console.log("response.data:", response.data);

      if (response.success) {
        console.log("Login successful! Processing response...");
        // Store token and role from response.data
        if (response.data?.token) {
          console.log("Storing token:", response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          console.warn("No token in response.data");
        }
        if (response.data?.role) {
          console.log("Storing role:", response.data.role);
          localStorage.setItem("userRole", response.data.role);
        } else {
          console.warn("No role in response.data");
        }

        console.log("Token stored:", localStorage.getItem("token"));
        console.log("Role stored:", localStorage.getItem("userRole"));

        // Navigate to home page after successful login and reload to update navbar
        console.log("Navigating to home...");
        navigate("/");
        window.location.reload();
      } else {
        console.log("Login failed - response.success is false");
        setError(response.message || "Login failed");
        // Clear password on error
        setFormData({
          ...formData,
          password: "",
        });
      }
    } catch (err: any) {
      let errorMessage = "Login failed. Please try again.";

      if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        errorMessage = err.response.data.errors.join(" ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.title) {
        errorMessage = err.response.data.title;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      // Clear password on error
      setFormData({
        ...formData,
        password: "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center py-8 sm:py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-light text-neutral-900 tracking-wide">
            Welcome Back
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-600 font-light">
            Login to continue
          </p>
        </div>

        <div className="bg-white border border-neutral-300 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm font-light">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-light text-neutral-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors text-sm font-light"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-light text-neutral-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors text-sm font-light"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-3 text-sm font-light tracking-wide hover:bg-neutral-800 active:bg-neutral-950 transition-all duration-300 disabled:bg-neutral-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 font-light">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-neutral-900 hover:underline font-normal cursor-pointer"
              >
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
