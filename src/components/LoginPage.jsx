import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../firebaseConfig";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import logo from '../assets/mu-icon-6.jpg';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: new Date(),
        },
        { merge: true }
      );

      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
      console.error("Login Error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="bg-white rounded-3xl p-10">
          <div className="max-w-md mx-auto text-center">
          <div className="flex flex-col items-center justify-center">
  {/* Logo and Name */}
  <div className="flex items-center space-x-2">
    <img src="https://res.cloudinary.com/dq0mpqvl7/image/upload/v1740396128/mu-icon-6_uqljmh.png" className="w-10 h-9" alt="MockitUpp Logo" />
    <h1 className="text-4xl font-bold text-cyan-700 bg-clip-text">
      MockitUpp
    </h1>
  </div>

  {/* Subtitle */}
  <p
    className="text-sm text-center mt-2"
    style={{ fontFamily: "var(--bs-font-sans-serif)", color: "rgb(149, 170, 201)" }}
  >
    Explore the world of competitive exams in a new way.
  </p>
</div>


            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-500 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-100"></div>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="mt-6 w-full flex items-center justify-center px-6 py-4 border-2 bg-blue-500 border-gray-200 rounded-xl text-gray-100 hover:bg-blue-600 focus:ring-4 focus:ring-blue-100 transform hover:scale-[1.02] transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                   <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#FFFFFF"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M12 23c3.07 0 5.64-1.02 7.52-2.77l-3.57-2.77c-1 0.68-2.27 1.08-3.95 1.08-3.03 0-5.6-2.03-6.52-4.77H1.72v2.87C3.63 19.9 7.52 23 12 23z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M5.48 13.77c-.23-.68-.36-1.41-.36-2.17s.13-1.49.36-2.17V6.56H1.72C.91 8.22.5 10.04.5 11.86s.41 3.64 1.22 5.3l3.76-2.87z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M12 4.86c1.67 0 3.17.58 4.36 1.7l3.23-3.23C17.64 1.02 15.07 0 12 0 7.52 0 3.63 3.1 1.72 6.56l3.76 2.87c.92-2.74 3.49-4.77 6.52-4.77z"
                    />
                  </svg>

                   Login with Google
                  </>
                )}
              </button>

              <hr style={{ border: "0.5px solid lightgray", width: "100%", margin: "10px 0" }} />

              <p style={{ textAlign: "center", fontSize: "14px" }}>
                <a
                  href="mailto:mockitupp2025@gmail.com"
                  style={{ color: "gray", textDecoration: "none" }}
                >
                  Having any trouble?
                </a>
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;