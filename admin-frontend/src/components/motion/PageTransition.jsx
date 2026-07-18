export const PageTransition = ({ children, locationKey }) => (
  <div key={locationKey} className="w-full h-full animate-in fade-in duration-300">
    {children}
  </div>
);
