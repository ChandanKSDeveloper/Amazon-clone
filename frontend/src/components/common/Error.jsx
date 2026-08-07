// src/components/common/Error.jsx
import { AlertCircle, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { amazonClasses } from "../../constants/amazonClasses";

const ErrorPage = ({ error, resetError }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-[#0F1111]">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error?.message || "Failed to load product details."}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate(-1)} className={amazonClasses.btnGhost}>
            Go Back
          </button>
          <button onClick={resetError} className={amazonClasses.btnPrimary}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;