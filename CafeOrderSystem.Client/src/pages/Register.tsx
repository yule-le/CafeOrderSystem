import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/authApi";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    setError(null);

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Check password requirements
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNonAlphanumeric = /[^a-zA-Z0-9]/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNonAlphanumeric) {
      const errors = [];
      if (!hasNonAlphanumeric)
        errors.push("at least one special character (!@#$%^&*)");
      if (!hasLowerCase) errors.push("at least one lowercase letter");
      if (!hasUpperCase) errors.push("at least one uppercase letter");
      setError(`Password must contain ${errors.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        // Navigate to login page after successful registration
        navigate("/login");
      } else {
        setError(response.message || "Registration failed");
        // Clear passwords on error
        setFormData({
          ...formData,
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err: any) {
      let errorMessage = "Registration failed. Please try again.";

      if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        // Display all validation errors
        errorMessage = err.response.data.errors.join(" ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.title) {
        errorMessage = err.response.data.title;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      // Clear passwords on error
      setFormData({
        ...formData,
        password: "",
        confirmPassword: "",
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
            Create Account
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-600 font-light">
            Join us for a better experience
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
                htmlFor="email"
                className="block text-sm font-light text-neutral-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors text-sm font-light"
                placeholder="Enter your email"
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
                placeholder="At least 6 characters"
              />
              <p className="mt-1 text-xs text-neutral-500 font-light">
                Must contain: uppercase, lowercase, and special character
                (!@#$%^&*)
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-light text-neutral-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors text-sm font-light"
                placeholder="Confirm your password"
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
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 font-light">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-neutral-900 hover:underline font-normal cursor-pointer"
              >
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
