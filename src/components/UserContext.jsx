import { createContext, useContext, useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig"; // Import Firebase config

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user] = useAuthState(auth);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (user) {
      setUserId(user.uid); // Store Firebase's uid
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ userId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
