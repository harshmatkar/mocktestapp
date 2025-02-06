import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Package, Book, AlertCircle, User, LogOut, Moon, Sun, Menu, X } from 'lucide-react';
import { auth, db } from '../firebaseConfig'; // Make sure your firebase config exports db
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, serverTimestamp, addDoc } from "firebase/firestore";
import logo from '../assets/mu-icon-6.jpg';


const DashBoard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [username, setUsername] = useState('Student');
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [purchasedTests, setPurchasedTests] = useState([]); // NEW: Track purchased tests
  const [user] = useAuthState(auth); // Get Firebase user state

  useEffect(() => {
    // Set username from Firebase auth
    if (user?.displayName) {
      setUsername(user.displayName);
    } else if (user?.email) {
      setUsername(user.email.split('@')[0]); 
    }
   

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, [user, navigate]); 

  // NEW: Fetch the tests the user has purchased
  useEffect(() => {
    const fetchPurchasedTests = async () => {
      if (user) {
        try {
          const transactionsRef = collection(db, "transactions");
          const q = query(transactionsRef, where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const tests = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.testTitle) {
              tests.push(data.testTitle);
            }
          });
          setPurchasedTests(tests);
        } catch (error) {
          console.error("Error fetching purchased tests:", error);
        }
      }
    };
    fetchPurchasedTests();
  }, [user]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleNotebookClick = () => {
    console.log("Navigating to /notebook");
    navigate('/notebook');
    setActiveSection('notebooks');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handlePayment = async (test) => {
    const options = {
      key: "rzp_test_K6FpSqlaj3aWci", // Replace with your actual Razorpay Key ID
      amount: 9900, // Amount in paise (50000 = ₹500)
      currency: "INR",
      name: "MockitUpp",
      description: `Payment for ${test.title}`,
      handler: async (response) => {
        console.log("Payment Successful:", response);
  
        // Store transaction in Firestore
        try {
          const transactionRef = collection(db, "transactions");
          await addDoc(transactionRef, {
            userId: user.uid,
            email: user.email,
            testTitle: test.title,
            amount: 500,
            transactionId: response.razorpay_payment_id,
            createdAt: serverTimestamp(),
          });
          alert("Payment successful! You can now access the test.");
          // Optionally, update the purchasedTests state immediately
          setPurchasedTests((prev) => [...prev, test.title]);
        } catch (error) {
          console.error("Error storing transaction:", error);
          alert("There was an error processing your transaction. Please try again.");
        }
      },
      prefill: {
        name: user.displayName || "Student",
        email: user.email,
      },
      theme: {
        color: "#3399cc",
      },
    };
  
    const razor = new window.Razorpay(options);
    razor.open();
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
    { icon: User, label: 'Profile', id: 'profile', onClick: () => { navigate('/profile'); setActiveSection('profile'); } },
    { icon: Book, label: 'SEE Mistakes(CET)', id: 'mistakes', onClick: () => { navigate('/mistakes'); setActiveSection('mistakes'); } }
  ];

  const mockTests = [
    { title: 'MHT CET Mock Tests', action: 'Take Mock Test', path: '/mocktestlistmhtcet', content:'30+ Mock Test of MHTCET'},
    { title: 'JEE MAIN Mock Tests', action: 'Take Mock Test', path: '/mocktestslist', content:'30+ Mock Test of JEE MAINS' },
    { title: 'JEE ADVANCED Mock Tests', action: 'Take Mock Test', path: '/mocktestslistneet', content:'10+ Mock Test of JEE ADVANCE' },
    { title: 'MHT CET PYQ', action: 'View Analytics', path: '/pyqcet' , content:'MHT CET PYQs of 10 Years'},
    { title: 'JEE MAIN PYQ', action: 'View Rank', path: '/competition' , content:'5000+ Chapterwise PYQ'},
    { title: 'JEE ADVANCED PYQ', action: 'View Analytics', path: '/analytics' , content:'PYQs of 10 years along with solution'}
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
          shadow-md flex flex-col p-4 border-r`
        }>
          <div className="flex items-center mt-12 lg:mt-0">
  <img 
    src={logo}
    className="w-8 h-8 mr-2" 
  />
  <h2 
      className={`
        text-2xl 
        font-bold 
        bg-gradient-to-r 
        from-red-300 
        to-purple-800 
        text-transparent 
        bg-clip-text
      
      `}
    >
      MockitUpp
    </h2>
</div>


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
              <span>SEE MISTAKES(JEE M)</span>
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
              <div key={index} className={`relative rounded-xl overflow-hidden ${
                isDarkMode ? 'bg-gray-800 shadow-gray-900/50' : 'bg-white shadow-lg'
              } transition-transform hover:-translate-y-1`}>
                <div className="h-28 overflow-hidden relative">
                  <img 
                    src="https://cdn.quizrr.in/web-assets/img/pack_banners/jee_main_2025_test_series_droppers.png" 
                    alt={test.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className={`
                  rounded-lg 
                  shadow-md 
                  p-4 
                  transition-all 
                  duration-300 
                  ease-in-out 
                  ${isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white hover:bg-gray-50 border border-gray-100'}
                `}>
                  <h3 className={`
                    text-lg 
                    font-bold 
                    mb-2 
                    truncate 
                    ${isDarkMode 
                      ? 'text-white' 
                      : 'text-gray-900'}
                  `}>
                    {test.title}
                  </h3>
                  
                  <div className={`
                    text-sm 
                    pl-4 
                    border-l-4 
                    ${isDarkMode 
                      ? 'text-gray-300 border-gray-700' 
                      : 'text-gray-600 border-gray-200'}
                    space-y-1 
                    leading-relaxed
                  `}>
                    {test.content && (
                      <p className="opacity-90">{test.content}</p>
                    )}
                  </div>
                </div>
                
                <div className="p-4 flex justify-between">
                  {/*
                    Conditionally render:
                    - If the test is purchased (i.e. its title is in the purchasedTests array), show the button to start/take the test.
                    - Otherwise, show the Buy Now / Payment button.
                  */}
                  {purchasedTests.includes(test.title) ? (
                    <button
                      onClick={() => navigate(test.path)}
                      className={`px-4 py-2 rounded-lg border-2 text-xs font-medium transition-colors
                        ${isDarkMode ? 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white' 
                          : 'border-blue-500 text-blue-500 hover:bg-blue-50'}`}
                    >
                      {test.action}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePayment(test)}
                      className="px-4 py-2 rounded-lg text-white flex items-center gap-2 border-1 border-red-500 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
                    >
                      <span className="text-lg font-bold text-green-400">₹99</span>
                      <span className="text-sm font-semibold">80% OFF</span>
                      <span className="text-sm text-gray-100 line-through">₹499</span>
                    </button>
                  )}
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
