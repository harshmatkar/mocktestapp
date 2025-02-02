import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import DashBoard from './components/DashBoard';
import MockTest from './components/Mocktest';
import MockTests from "./components/Mocktestlist";
import MockTestscet from "./components/mocktestlistmhtcet";
import TestPage from './components/TestPageduplicate'; // New TestPage
import TestPagecet from './components/mhtcettestpage'; // New TestPage
import ResultPage from './components/result';
import Instruction from './components/instructions';
import Instructioncet from './components/instructionscet';
import NotebookPage from './components/notebook';
import ProfilePage from './components/profile';
import Pyqcet from './components/pyqmhtcet';
import { UserProvider } from './components/UserContext'; // Import UserProvider

function App() {
  return (
    <UserProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashBoard />} />
        {/* <Route path="/mock-test-selection" element={<MockTestSelection />} /> */}
        <Route path="/mock-test" element={<MockTest />} />
        <Route path="/mocktestslist" element={<MockTests />} />
        <Route path="/mocktestlistmhtcet" element={<MockTestscet />} />
  
        <Route path="/test/:testId" element={<TestPage />} />
        <Route path="/testcet/:testIdcet" element={<TestPagecet />} />
        <Route path="/instructions/:testId" element={<Instruction />} />
        <Route path="/instructionscet/:testIdcet" element={<Instructioncet />} />
        
        <Route path="/results/:testId" element={<ResultPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/notebook" element={<NotebookPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/pyqcet" element={<Pyqcet />} />

        
      </Routes>
    </BrowserRouter>
    </UserProvider>  
  );
}

export default App;
