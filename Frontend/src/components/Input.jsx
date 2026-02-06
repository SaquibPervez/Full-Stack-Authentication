import { Eye, EyeOff } from "lucide-react";

const Input = ({ label, icon: Icon, type, name, togglePassword, showPassword, setShowPassword, ...props }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      {Icon && <Icon className="w-4 h-4" />} {label}
    </label>
    <div className="relative">
      <input
        type={type === "password" && togglePassword ? (showPassword ? "text" : "password") : type}
        name={name}
        className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none pr-10 transition-all"
        {...props}
      />
      {togglePassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  </div>
);

export default Input;