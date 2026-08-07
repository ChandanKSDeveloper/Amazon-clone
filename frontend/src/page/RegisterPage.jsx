import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/userSlice';

// --- Amazon Style CSS Classes ---
const amazonInput = `
  w-full h-10 px-3 rounded-sm border border-gray-300 text-sm text-[#0F1111] bg-white
  focus:outline-none focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] focus:shadow-[0_0_0_3px_rgba(228,168,49,0.3)]
  placeholder:text-gray-500
`;

const amazonPrimaryBtn = `
  w-full h-10 rounded-sm text-sm font-medium 
  bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#E7B800] active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]
  text-[#0F1111] shadow-sm hover:shadow-md transition-all
  disabled:bg-[#FFD814] disabled:opacity-60 disabled:cursor-not-allowed
`;

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, isAuthenticated, authChecked } = useSelector((state) => state.user);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      navigate('/');
      toast.success('Registration successful!');
    }
  }, [isAuthenticated, authChecked, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setAvatar(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    if (avatar) {
      formDataToSend.append('avatar', avatar);
    }
    

    await dispatch(registerUser(formDataToSend));
  };

  // Show loading state while initial auth check is running
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
        
        {/* Amazon uses a centered narrow container with a subtle border for auth forms */}
        <div className="max-w-sm w-full border border-gray-300 rounded-sm p-6 sm:p-10">
          
          <div className="text-center mb-6">
            <Link to="/" className="text-2xl font-bold text-[#0F1111] mb-2 inline-block">
              ShopHub
            </Link>
            <h2 className="text-xl font-normal text-[#0F1111]">
              Create account
            </h2>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
            
            {/* Avatar Upload */}
            <div>
              <label className="block text-xs font-bold text-[#0F1111] mb-1">
                Profile Photo (Optional)
              </label>
              <div className="flex items-center space-x-3">
                {avatarPreview ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300 shrink-0">
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center shrink-0">
                    <UserPlus className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  className="flex-1 text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-[#E3E6E6] file:text-[#0F1111] hover:file:bg-[#D5D9D9] cursor-pointer"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Max size: 5MB (JPEG, PNG, GIF, WEBP)
              </p>
            </div>

            {/* Your Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-[#0F1111] mb-1">
                Your name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={amazonInput}
                placeholder="First and last name"
              />
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#0F1111] mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={amazonInput}
                placeholder="you@example.com"
              />
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#0F1111] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p id="password-helper" className="mt-1 text-[11px] text-gray-500">
                Passwords must be at least 6 characters.
              </p>
            </div>
            
            {/* Re-enter Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#0F1111] mb-1">
                Re-enter password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${amazonInput} pr-10`}
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`${amazonPrimaryBtn} mt-6 flex items-center justify-center gap-2`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create your ShopHub account'
              )}
            </button>
          </form>

          {/* Divider & Footer */}
          <div className="mt-6 flex items-center gap-3 text-xs text-gray-500">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span>Already have an account?</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <Link
            to="/login"
            className="block w-full text-center h-9 leading-9 rounded-sm text-sm font-medium 
                       bg-[#E3E6E6] hover:bg-[#D5D9D9] active:bg-[#C7C9C9]
                       text-[#0F1111] border border-gray-300 mt-4 transition-colors"
          >
            Sign in
          </Link>

          {/* Amazon Legal Footer Text */}
          <p className="mt-4 text-[11px] text-gray-600 leading-relaxed text-center">
            By creating an account, you agree to ShopHub's{' '}
            <a href="#" className="text-[#007185] hover:text-[#C7511F] hover:underline">Conditions of Use</a> and{' '}
            <a href="#" className="text-[#007185] hover:text-[#C7511F] hover:underline">Privacy Notice</a>.
          </p>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;