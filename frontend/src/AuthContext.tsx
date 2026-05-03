import React, { createContext, useContext, useEffect, useState } from 'react';

interface DiscordUser {
  discordId: string;
  discordName: string;
  email?: string;
}

interface AuthContextType {
  discordUser: DiscordUser | null;
  setDiscordUser: (user: DiscordUser | null) => void;
  logout: () => void;
  isLoading: boolean;
  returnTo: string | null;
  setReturnTo: (path: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [returnTo, setReturnTo] = useState<string | null>(null);

  // Load Discord user from localStorage on app mount
  useEffect(() => {
    const storedUser = localStorage.getItem('discordUser');
    if (storedUser) {
      try {
        setDiscordUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored Discord user:', err);
        localStorage.removeItem('discordUser');
      }
    }
    setIsLoading(false);
  }, []);

  // Handle OAuth callback parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const discordId = params.get('discordId');
    const discordName = params.get('discordName');
    const email = params.get('email');

    if (discordId && discordName) {
      const user: DiscordUser = {
        discordId,
        discordName,
        email: email || undefined,
      };
      setDiscordUser(user);
      
      // Clean up URL by removing query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Persist Discord user to localStorage whenever it changes
  useEffect(() => {
    if (discordUser) {
      localStorage.setItem('discordUser', JSON.stringify(discordUser));
    } else {
      localStorage.removeItem('discordUser');
    }
  }, [discordUser]);

  const logout = () => {
    setDiscordUser(null);
    localStorage.removeItem('discordUser');
  };

  return (
    <AuthContext.Provider value={{ discordUser, setDiscordUser, logout, isLoading, returnTo, setReturnTo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
