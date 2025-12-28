
import React ,{useState} from 'react';
import { Menu, X, Home, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';


interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  breadcrumbs?: { name: string; href?: string }[];
  username?: string;
  siteName?: string;
}

export default function Navbar({
  onToggleSidebar,
  sidebarOpen,
  breadcrumbs = [{ name: 'Home', href: '/' }, { name: 'Dashboard' }],
  username = 'admin',
  siteName = 'Site administration'
}: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);
  const closeDropdown = () => setDropdownOpen(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-[#417690] dark:bg-[#363636] text-white shadow-md sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-white hover:bg-[#305d70] dark:hover:bg-[#2a2a2a] lg:hidden"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <a href="/" className="ml-4 flex items-center text-xl font-bold lg:ml-0">
              <Home className="mr-2 h-6 w-6" />
              <span className="hidden sm:inline">{siteName}</span>
              <span className="sm:hidden">Admin</span>
            </a>
          </div>

         
          <nav className="hidden md:flex flex-1 justify-center text-sm space-x-2">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {crumb.href ? (
                  <a href={crumb.href} className="hover:underline">{crumb.name}</a>
                ) : (
                  <span className="font-medium">{crumb.name}</span>
                )}
                {i < breadcrumbs.length - 1 && <span className="opacity-70">/</span>}
              </React.Fragment>
            ))}
          </nav>

          
          <div className="flex items-center space-x-4">
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-[#305d70] dark:hover:bg-[#2a2a2a]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

           
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#305d70] dark:hover:bg-[#2a2a2a] focus:outline-none"
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">{username}</span>
              </button>

             
              {dropdownOpen && (
                <>
                  
                  <div
                    className="fixed inset-0 z-10 lg:hidden"
                    onClick={closeDropdown}
                  />

                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20">
                    <a
                      href="/profile"
                      className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={closeDropdown}
                    >
                      View profile
                    </a>
                    <a
                      href="/change-password"
                      className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={closeDropdown}
                    >
                      Change password
                    </a>
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <a
                     
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={closeDropdown}
                    >
                      <button
                        onClick={() => {
                          logout();
                          navigate("/login");
                        }}
                      >
                        Logout
                      </button>
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}