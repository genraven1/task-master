import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/habits', label: 'Habits', icon: '🔄' },
  { path: '/dailies', label: 'Dailies', icon: '📅' },
  { path: '/todos', label: 'Todos', icon: '✅' },
  { path: '/city', label: 'City', icon: '🏰' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-brand-darker border-t border-purple-900/40 z-40 safe-area-pb">
      <div className="flex items-stretch max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 min-h-[56px] transition-colors ${
                isActive
                  ? 'text-brand-purple'
                  : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-xl leading-tight">{item.icon}</span>
                <span className={`text-[10px] font-semibold leading-tight ${isActive ? 'text-brand-purple' : 'text-gray-500'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-6 h-0.5 bg-brand-purple rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
