/**
 * AuthCard — inner form container used inside AuthLayout's right panel.
 *
 * Provides consistent width, full height, flex-column layout,
 * and a scrollable content area for the form body.
 */
export default function AuthCard({ children }) {
  return (
    <div className="w-full max-w-[360px] h-full flex flex-col justify-start overflow-hidden">
      {children}
    </div>
  );
}
