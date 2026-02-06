import { Loader2 } from "lucide-react";

const Button = ({ children, isLoading, ...props }) => (
  <button
    disabled={isLoading}
    className="w-full py-3 px-4 font-semibold text-white rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-70 flex justify-center items-center gap-2"
    {...props}
  >
    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
    {children}
  </button>
);

export default Button;