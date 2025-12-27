import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCart } from "../api/cartApi";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Check if user is logged in by checking for token
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole"); // "Admin" or "Customer"
    setIsLoggedIn(!!token);
    setUserRole(role);

    // Load cart count for Customer
    if (token && role === "Customer") {
      loadCartCount();
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      if (role === "Customer") {
        loadCartCount();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const loadCartCount = async () => {
    try {
      const cartData = await getCart();
      if (cartData?.items && Array.isArray(cartData.items)) {
        setCartItemCount(cartData.items.length);
      }
    } catch (err) {
      console.error("Failed to load cart count", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-neutral-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900"
              >
                <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 007.5 9.75c.627.47 1.406.75 2.25.75.844 0 1.624-.28 2.25-.75.626.47 1.406.75 2.25.75.844 0 1.623-.28 2.25-.75a3.75 3.75 0 004.902-5.652l-1.3-1.299a1.875 1.875 0 00-1.325-.549H5.223z" />
                <path
                  fillRule="evenodd"
                  d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 009.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 002.25.506c.804 0 1.567-.182 2.25-.506 1.42.674 3.08.675 4.5.001v8.755h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3zm3-6a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v3a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-3zm8.25-.75a.75.75 0 00-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-5.25a.75.75 0 00-.75-.75h-3z"
                  clipRule="evenodd"
                />
              </svg>
              <h1 className="text-base sm:text-xl font-light text-neutral-900 tracking-wide cursor-pointer">
                Cafe Order
              </h1>
            </Link>
          </div>
          <div className="flex space-x-4 sm:space-x-8">
            {isLoggedIn ? (
              <>
                {userRole === "Admin" ? (
                  <>
                    <Link
                      to="/product-management"
                      className="text-neutral-700 hover:text-neutral-900 transition-colors duration-300 text-xs sm:text-sm font-light cursor-pointer"
                    >
                      Products
                    </Link>
                    <Link
                      to="/order-management"
                      className="text-neutral-700 hover:text-neutral-900 transition-colors duration-300 text-xs sm:text-sm font-light cursor-pointer"
                    >
                      Orders
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      className="text-neutral-700 hover:text-neutral-900 transition-colors duration-300 text-xs sm:text-sm font-light cursor-pointer"
                    >
                      Products
                    </Link>
                    <Link
                      to="/my-orders"
                      className="text-neutral-700 hover:text-neutral-900 transition-colors duration-300 text-xs sm:text-sm font-light cursor-pointer"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/cart"
                      className="text-neutral-700 hover:text-neutral-900 transition-colors duration-300 text-xs sm:text-sm font-light cursor-pointer relative"
                      title="Cart"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                        />
                      </svg>
                      {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-light">
                          {cartItemCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="text-neutral-700 hover:text-neutral-900 transition-colors duration-300 text-xs sm:text-sm font-light cursor-pointer border-b border-neutral-500 hover:border-neutral-900 pb-0.5"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="text-neutral-700 hover:text-neutral-900 transition-colors duration-300 text-xs sm:text-sm font-light cursor-pointer"
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="text-neutral-700 hover:text-neutral-900 transition-colors duration-300 text-xs sm:text-sm font-light cursor-pointer"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-neutral-700 hover:text-neutral-900 transition-colors duration-300 text-xs sm:text-sm font-light border-b border-neutral-500 hover:border-neutral-900 pb-0.5 cursor-pointer"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
