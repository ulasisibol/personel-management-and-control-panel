import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh; // Viewport'un tamamını kaplar
  background-color: rgb(32 33 35);
  overflow: hidden; // Dışarıya taşan içerikleri keser
`;

const ContentArea = styled.div`
  flex-grow: 1;
  overflow: auto; // İçerik fazla olduğunda scrollbar aktif olur
  padding-top: 60px; // Header'ın yüksekliği kadar boşluk bırakır
`;

const MainContent = styled.main`
  padding: 20px;
  overflow-y: auto; // Yatay olarak içerik fazla olduğunda scrollbar gösterir
  height: calc(100vh - 60px); // Header'ın yüksekliğini çıkartır
`;

const DashboardLayout = () => {
  return (
    <LayoutContainer>
      <Sidebar />
      <ContentArea>
        <Header />
        <MainContent>
          <Outlet />
        </MainContent>
      </ContentArea>
    </LayoutContainer>
  );
};

export default DashboardLayout;
