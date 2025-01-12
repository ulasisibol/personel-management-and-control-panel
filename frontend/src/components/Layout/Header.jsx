import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import styled from 'styled-components';
import logo1 from "../../assets/logo-1.png"


const HeaderContainer = styled.header`
  width: 100%;
  height: 60px; // Header yüksekliği ayarlama
  background-color: #000;
  border-bottom: 1px solid rgb(32 33 35);;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  position: fixed; // Header'ı sabitle
  top: 0;
  left: 0;
  z-index: 1001; // Sidebar ve diğer elementlerin üstünde olması için
`;

const LogoutButton = styled.button`
  color: white;
  background-color: transparent;
  border: 1px solid white;
  padding: 5px 15px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: white;
    color: black;
  }
`;

const Header = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <HeaderContainer>
      
      <div style={{paddingTop: "20px"}}><img style={{width: "60px"}} src={logo1} alt="hansel"/>Welcome, {user?.username}</div>
      <LogoutButton onClick={handleLogout}>
        Logout
      </LogoutButton>
    </HeaderContainer>
  );
};

export default Header;
