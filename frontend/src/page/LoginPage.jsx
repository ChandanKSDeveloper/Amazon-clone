import { useState, useEffect } from "react";
import { amazonInput, amazonPrimaryBtn } from "../constants/amazonClasses";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link, replace } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginUser, clearError } from "../redux/slices/userSlice";
import { toast } from "sonner";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const { loading, error, isAuthenticated, authChecked } = useSelector(
    (state) => state.user,
  );

  useEffect(() => {
    if(authChecked && isAuthenticated){
        navigate(from, {replace:true});
    }
  }, [isAuthenticated, authChecked, navigate, from])

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please Fill in all details");
    }

    try {
      const result = await dispatch(loginUser(formData));

      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Welcume back");
      }
    } catch (error) {
        toast.error('Login failed. Please try again.');
        console.log(error)
    }
  };

  if (!authChecked) {
    return (
      <>
        <div className="min-h-[80vh] flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#FF9900]" />
            <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="min-h-[80vh] flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full border border-gray-300 rounded-sm p-6 sm:p-10">
          <div className="text-center mb-6">
            <Link
              to="/"
              className="text-2xl font-bold text-[#0F1111] mb-4 inline-block"
            >
              ShopHub
            </Link>
            <h2 className="text-xl font-normal text-[#0F1111]">Sign in</h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-[#0F1111] mb-1"
              >
                Email (phone for mobile accounts)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={amazonInput}
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-[#0F1111] mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`${amazonInput} pr-10`}
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`${amazonPrimaryBtn} mt-2 flex items-center justify-center gap-2`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          {/* Divider & Footer */}
          <div className="mt-6 flex items-center gap-3 text-xs text-gray-500">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span>New to ShopHub?</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <Link
            to="/register"
            className="block w-full text-center h-9 leading-9 rounded-sm text-sm font-medium 
                        bg-[#E3E6E6] hover:bg-[#D5D9D9] active:bg-[#C7C9C9]
                        text-[#0F1111] border border-gray-300 mt-4 transition-colors"
          >
            Create your ShopHub account
          </Link>

          {/* Amazon Legal Footer Text */}
          <p className="mt-6 text-[11px] text-gray-600 leading-relaxed text-center">
            By continuing, you agree to ShopHub's{" "}
            <a
              href="#"
              className="text-[#007185] hover:text-[#C7511F] hover:underline"
            >
              Conditions of Use
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-[#007185] hover:text-[#C7511F] hover:underline"
            >
              Privacy Notice
            </a>
            .
          </p>

          <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-[#007185] hover:text-[#C7511F] cursor-pointer group">
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 16 16">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5a5.5 5.5 0 110-11 5.5 5.5 0 010 11zM7.25 5.5h1.5v1.5h-1.5V5.5zM7.25 8h1.5v2.5h-1.5V8z" />
            </svg>
            <span className="group-hover:underline">Need help?</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
