'use client';

import React, { ReactNode } from 'react';
import AlertProvider from './AlertProvider';
import ModalProvider from './ModalProvider';

interface HooksProviderProps {
  children: ReactNode;
}

/**
 * HooksProvider รวม Provider ทั้งหมดในแพ็คเกจเข้าด้วยกัน
 * ใช้ตัวนี้ตัวเดียวจะได้ความสามารถของทั้ง AlertProvider และ ModalProvider
 */
export const HooksProvider: React.FC<HooksProviderProps> = ({ children }) => {
  return (
    <AlertProvider>
      <ModalProvider>
        {children}
      </ModalProvider>
    </AlertProvider>
  );
};

export default HooksProvider;
