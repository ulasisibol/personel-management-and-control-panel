// src/context/AuthProvider.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// 1) Context oluştur
export const AuthContext = createContext();

// 2) Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Uygulama ilk açıldığında localStorage’dan user ve token’i çekip state’e koy
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  // Backend’e login isteği atan fonksiyon
  const loginRequest = async (username, password) => {
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        username,
        password,
      });

      // Dönen data: { token, user: {...}, message: 'Giriş başarılı' }
      const { token, user } = res.data;

      // State güncelle
      setUser(user);
      setToken(token);

      // localStorage’a kaydet
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      return true; // Başarılı dönüş
    } catch (err) {
      console.error('Login hatası:', err);
      return false; // Başarısız
    }
  };

  // Eğer login işlemini form tarafında yönetip oradan veriyi alıyorsanız, 
  // bu metot yerine “login(userData, token)” gibi bir şey de kullanabilirsiniz. 
  // Ama genelde AXIOS isteğini burada yapmak pratik olur.

  // Context’e koyacağımız login fonksiyonu (alternatif)
  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  // Çıkış
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // 3) Value
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loginRequest, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 4) useAuth Hook'u
export const useAuth = () => useContext(AuthContext);
