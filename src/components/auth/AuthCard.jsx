/**
 * AuthCard — inner form container used inside AuthLayout's right panel.
 * Fits height smoothly with zero scrollbars.
 */
export default function AuthCard({ children }) {
  return (
    <div className="w-full max-w-[360px] h-auto md:h-full flex flex-col justify-between overflow-visible md:overflow-hidden py-1">
      {children}
    </div>
  );
}
