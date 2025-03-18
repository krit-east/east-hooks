'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// ประเภทของ Modal 
export type ModalType = 'confirm' | 'notification';

// Props สำหรับ Modal
export interface ModalProps {
  title: string;
  content: string;
  type: ModalType;
  onConfirm?: () => void;
  onCancel?: () => void;
  duration?: number; // สำหรับ notification modal (มิลลิวินาที)
}

// Modal State
interface ModalState extends ModalProps {
  isOpen: boolean;
  timeLeft?: number; // สำหรับการนับถอยหลัง
}

// Context Props
interface ModalContextProps {
  modalState: ModalState;
  showConfirmModal: (title: string, content: string, onConfirm: () => void, onCancel?: () => void) => void;
  showNotificationModal: (title: string, content: string, duration?: number) => void;
  closeModal: () => void;
}

const initialModalState: ModalState = {
  isOpen: false,
  title: '',
  content: '',
  type: 'notification',
};

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const useModal = (): ModalContextProps => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal ต้องใช้ภายใน ModalProvider');
  return context;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>(initialModalState);
  const [timerId, setTimerId] = useState<number | null>(null);
  const [exiting, setExiting] = useState<boolean>(false);

  // เพิ่ม style สำหรับ animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes modalBackdropIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes modalBackdropOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes modalContentIn {
        from { 
          opacity: 0; 
          transform: scale(0.9);
        }
        to { 
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes modalContentOut {
        from { 
          opacity: 1;
          transform: scale(1);
        }
        to { 
          opacity: 0;
          transform: scale(0.95);
        }
      }
      @keyframes modalCountdown {
        from { width: 100%; }
        to { width: 0%; }
      }
    `;
    document.head.appendChild(style);

    return () => { document.head.removeChild(style); };
  }, []);

  // แสดง Modal ยืนยัน
  const showConfirmModal = useCallback((
    title: string, 
    content: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) => {
    setExiting(false);
    setModalState({
      isOpen: true,
      title,
      content,
      type: 'confirm',
      onConfirm,
      onCancel: onCancel || closeModal,
    });
  }, []);

  // แสดง Modal แจ้งเตือน
  const showNotificationModal = useCallback((
    title: string, 
    content: string, 
    duration: number = 5000
  ) => {
    // ล้างไทเมอร์เก่าถ้ามี
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    
    setExiting(false);
    setModalState({
      isOpen: true,
      title,
      content,
      type: 'notification',
      timeLeft: Math.ceil(duration / 1000),
      duration,
    });

    // ตั้งไทเมอร์นับถอยหลัง
    const intervalId = window.setInterval(() => {
      setModalState(prev => {
        if (prev.timeLeft && prev.timeLeft > 1) {
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        } else {
          clearInterval(intervalId);
          return { ...prev, timeLeft: 0 };
        }
      });
    }, 1000);

    setTimerId(intervalId);

    // ตั้งเวลาปิดอัตโนมัติ
    setTimeout(() => {
      closeModal();
    }, duration);
  }, []);

  // ปิด Modal
  const closeModal = useCallback(() => {
    // ล้างไทเมอร์ถ้ามี
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }

    // Animation ก่อนปิด
    setExiting(true);
    
    // รอให้ animation ทำงานเสร็จก่อนปิด
    setTimeout(() => {
      setModalState(initialModalState);
      setExiting(false);
    }, 300);
  }, [timerId]);

  return (
    <ModalContext.Provider value={{ modalState, showConfirmModal, showNotificationModal, closeModal }}>
      {children}

      {/* Modal UI */}
      {modalState.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          animation: exiting ? 'modalBackdropOut 0.25s ease forwards' : 'modalBackdropIn 0.25s ease',
        }}>
          <div style={{
            backgroundColor: '#1e1e1e',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '560px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            animation: exiting ? 'modalContentOut 0.2s ease forwards' : 'modalContentIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 20px 0px',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{modalState.title}</h3>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#9a9a9a',
                  cursor: 'pointer',
                  padding: '0 5px',
                  lineHeight: '1',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#9a9a9a')}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px', color: '#f5f5f5' }}>
              <div style={{ margin: '0 0 30px 0', lineHeight: '1.5', color: '#e0e0e0' }}>
                {typeof modalState.content === 'string' && modalState.content.split('\n').map((paragraph, index) => (
                  <p key={index} style={{ marginBottom: '16px' }}>{paragraph}</p>
                ))}
              </div>

              {/* Countdown for notification modal */}
              {modalState.type === 'notification' && modalState.timeLeft && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '5px', fontSize: '0.9rem', color: '#9a9a9a' }}>
                    จะปิดอัตโนมัติในอีก {modalState.timeLeft} วินาที
                  </div>
                  <div style={{ position: 'relative', height: '3px', backgroundColor: '#333', borderRadius: '2px' }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${(modalState.timeLeft / (modalState.duration! / 1000)) * 100}%`,
                      backgroundColor: '#4CAF50',
                      borderRadius: '2px',
                      transition: 'width 1s linear',
                    }} />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                {modalState.type === 'confirm' && (
                  <>
                    <button
                      onClick={() => {
                        if (modalState.onCancel) modalState.onCancel();
                      }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#ff5252', // สีแดง
                        transition: 'background-color 0.2s',
                        fontWeight: '500',
                        fontSize: '14px',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 82, 82, 0.1)')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        if (modalState.onConfirm) modalState.onConfirm();
                        closeModal();
                      }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#2196F3',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        fontWeight: '500',
                        fontSize: '14px',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0d8aee')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2196F3')}
                    >
                      Action
                    </button>
                  </>
                )}

                {modalState.type === 'notification' && (
                  <button
                    onClick={closeModal}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#2196F3',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      fontWeight: '500',
                      fontSize: '14px',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0d8aee')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2196F3')}
                  >
                    Action
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
