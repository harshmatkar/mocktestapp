import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Package, Book, AlertCircle, User, LogOut, Moon, Sun, Menu, X } from 'lucide-react';
import { auth } from '../firebaseConfig'; // Update with your actual path
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';




const DashBoard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [username, setUsername] = useState('Student');
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user] = useAuthState(auth); // Get Firebase user state

  useEffect(() => {
    // Set username from Firebase auth
    if (user?.displayName) {
      setUsername(user.displayName);
    } else if (user?.email) {
      setUsername(user.email.split('@')[0]); 
    }

   
    if (!user) {
      navigate('/login');
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, [user, navigate]); 

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleNotebookClick = () => {
    console.log("Navigating to /notebook");
    navigate('/notebook');
    setActiveSection('notebooks');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const sidebarItems = [
    { icon: Home, label: 'Home', id: 'home', onClick: () => { navigate('/'); setActiveSection('home'); } },
    { icon: Package, label: 'Packs', id: 'packs', onClick: () => { navigate('/packs'); setActiveSection('packs'); } },
    { icon: AlertCircle, label: 'My Mistakes', id: 'mistakes', onClick: () => { navigate('/mistakes'); setActiveSection('mistakes'); } },
    { icon: User, label: 'Profile', id: 'profile', onClick: () => { navigate('/profile'); setActiveSection('profile'); } }
  ];

  const mockTests = [
    { title: 'MHT CET Mock Tests', action: 'Start Practice', path: '/mocktestlistmhtcet' },
    { title: 'JEE MAIN Mock Tests', action: 'Take Mock Test', path: '/mocktestslist' },
    { title: 'JEE ADVANCED Mock Tests', action: 'Take Mock Test', path: '/mocktestslistneet' },
    { title: 'MHT CET PYQ', action: 'View Analytics', path: '/pyqcet' },
    { title: 'JEE MAIN PYQ', action: 'View Rank', path: '/competition' },
    { title: 'JEE ADVANCED PYQ', action: 'View Analytics', path: '/analytics' }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-4 left-4 z-50 p-2 rounded-lg lg:hidden
          ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed lg:sticky top-0 h-screen w-64 z-40 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
          shadow-md flex flex-col p-4 border-r`}
        >
          <h2 className={`text-2xl font-bold mt-12 lg:mt-0 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Dashboard
          </h2>

          <nav className="flex flex-col gap-2 mt-6">
            {/* Regular sidebar items */}
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`flex items-center p-3 gap-3 rounded-lg transition-colors
                  ${activeSection === item.id 
                    ? (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-600')
                    : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}

            {/* Separate Notebook button */}
            <button
              onClick={handleNotebookClick}
              className={`flex items-center p-3 gap-3 rounded-lg transition-colors
                ${activeSection === 'notebooks' 
                  ? (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-600')
                  : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')}`}
            >
              <Book size={20} />
              <span>Notebook</span>
            </button>
          </nav>

          <div className="mt-auto flex flex-col gap-2">
            <button
              onClick={toggleDarkMode}
              className={`flex items-center p-3 gap-3 rounded-lg transition-colors w-full
                ${isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {isDarkMode ? (
                <>
                  <Sun size={20} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={20} />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className='flex items-center p-3 gap-3 rounded-lg transition-colors w-full text-red-400'
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Rest of the code remains the same */}
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 p-4 lg:p-8 ml-0 lg:ml-0">
          <div className="mb-8 mt-16 lg:mt-0">
            <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Good Afternoon, <span className="text-blue-500">{username}!</span>
            </h1>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Welcome back! All the best because #PaperPhodnaHai
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {mockTests.map((test, index) => (
              <div
                key={index}
                className={`relative rounded-xl overflow-hidden ${
                  isDarkMode ? 'bg-gray-800 shadow-gray-900/50' : 'bg-white shadow-lg'
                } transition-transform hover:-translate-y-1`}
              >
                <div className="h-28 overflow-hidden relative">
                  <img 
                    src="https://cdn.quizrr.in/web-assets/img/pack_banners/jee_main_2025_test_series_droppers.png"
                    alt={test.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0">
                    <span className={`inline-block py-1 px-3 text-xs font-bold bg-red-500 text-white
                      rounded-bl-lg ${isDarkMode ? 'border-l border-b border-gray-700' : 'border-l border-b border-white'}`}>
                      New
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {test.title}
                  </h3>
                  <p className={`text-sm line-clamp-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                  </p>
                </div>

                <div className="p-4 flex justify-end">
                  <button
                    onClick={() => navigate(test.path)}
                    className={`px-4 py-2 rounded-lg border-2 text-xs font-medium transition-colors
                      ${isDarkMode 
                        ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' 
                        : 'border-red-500 text-red-500 hover:bg-red-50'}`}
                  >
                    {test.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;