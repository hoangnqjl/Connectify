import { createContext, useContext, useState, useMemo } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      isLoading,
      setIsLoading,
      isFetched,
      setIsFetched,
    }),
    [user, isLoading, isFetched]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);