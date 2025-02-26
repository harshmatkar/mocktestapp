import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [isNavbarSolid, setIsNavbarSolid] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const texts = [
    "Easy Learning",
    "90+ Tests of 3 Exams",
    "More Fun",
    "Exact NTA Screen",
    "Analysis using AI",
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsNavbarSolid(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Typing animation effect
  useEffect(() => {
    const currentText = texts[textIndex];
    const typing = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentText.length) {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(currentText.slice(0, displayedText.length - 1));
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 50 : 150);

    return () => clearTimeout(typing);
  }, [displayedText, isDeleting, textIndex, texts]);

  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/login');
  };

  const features = [
    {
      title: 'Interactive Learning',
      description: 'Engage with dynamic, interactive study materials tailored for JEE and NEET preparation.',
      icon: '🔬'
    },
    {
      title: 'Comprehensive Resources',
      description: 'Access a vast library of study guides, practice papers, and expert-curated content.',
      icon: '📚'
    },
    {
      title: 'Performance Tracking',
      description: 'Monitor your progress with advanced analytics and personalized improvement recommendations.',
      icon: '📊'
    },
    {
      title: 'Adaptive Learning',
      description: 'Smart algorithms that adjust difficulty based on your performance and learning style.',
      icon: '💡'
    }
  ];

  const achievements = [
    // { number: '500+', text: 'Successful Students' },
    // { number: '100+', text: 'Expert Tutors' },
    // { number: '95%', text: 'Success Rate' },
    // { number: '10+', text: 'Years of Experience' }
  ];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isNavbarSolid ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${isNavbarSolid ? 'text-blue-600' : 'text-white'}`}>
                MockitUpp
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {['Home', 'Features', 'About', 'Courses'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`${isNavbarSolid ? 'text-gray-600' : 'text-white'} hover:text-blue-500 transition-colors duration-300`}
                >
                  {item}
                </a>
              ))}
              <button 
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors duration-300"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`${isNavbarSolid ? 'text-gray-600' : 'text-white'}`}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
  <div className="md:hidden bg-gray-800 text-amber-100 rounded-lg shadow-lg top-16 right-4">
    {['Home', 'Features', 'About', 'Courses'].map((item) => (
      <a
        key={item}
        href={`#${item.toLowerCase()}`}
        className="block px-4 py-2 text-white hover:bg-gray-700 hover:text-white transition-colors duration-200"
        onClick={() => setIsMenuOpen(false)}
      >
        {item}
      </a>
    ))}
    <div className="px-4 py-3">
      <button
        className="w-full bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors duration-300"
        onClick={handleGetStarted}
      >
        Get Started
      </button>
    </div>
  </div>
)}

        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://png.pngtree.com/thumb_back/fw800/background/20221108/pngtree-scientific-formulas-physics-blackboard-education-image_1457080.jpg"
            alt="Background"
            className="w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gray-900 opacity-80"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            MockitUpp have
          </h1>
          <div className="text-3xl md:text-5xl font-bold text-amber-200 h-20 flex items-center justify-center">
            {displayedText}
            <span className="w-1 h-12 bg-white ml-2 animate-blink"></span>
          </div>
          <button 
            onClick={handleGetStarted}
            className="mt-8 px-8 py-4 bg-white text-blue-600 rounded-full text-xl font-bold hover:transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            View Courses & Test Series
          </button>
        </div>
        <div className="absolute bottom-10 w-full text-center">
          <ChevronDown className="w-10 h-10 text-white animate-bounce mx-auto" />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50" id="features">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Why Choose <span className="text-blue-600">Mockitupp?</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      {/* <div className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">
            Our Achievements
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl text-center"
              >
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {achievement.number}
                </div>
                <div className="text-gray-600">{achievement.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center space-x-6 mb-8">
            {[
              { Icon: Facebook },
              { Icon: Twitter},
              { Icon: Instagram },
              { Icon: Linkedin }
            ].map(({ Icon, link }, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors duration-300"
              >
                <Icon size={24} />
              </a>
            ))}
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} MockitUpp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;