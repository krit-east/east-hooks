'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAlert } from '../providers/AlertProvider';
import { useModal } from '../providers/ModalProvider';

export interface RequestOptions {
  alert?: boolean;
  headers?: Record<string, string>;
  immediate?: boolean;
  confirmModal?: {
    title: string;
    content: string;
  };
  notificationModal?: {
    title?: string;
    content?: string;
    duration?: number;
  };
}

export interface ApiResponseWithAlert {
  message: string;
  description: string;
  status: 'success' | 'info' | 'warning' | 'error';
  [key: string]: any;
}

const mapStatusToAlertType = (status: string) => {
  switch (status) {
    case 'success': return 'success';
    case 'warning': return 'warning';
    case 'error': return 'error';
    default: return 'info';
  }
};

export const useFetch = <T,>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, options: RequestOptions = {}, bodyData?: any) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { showAlert } = useAlert();
  const { showConfirmModal, showNotificationModal } = useModal();

  const executeRequest = async () => {
    setLoading(true);
    setError(null);

    const headers = options.headers || {};

    const requestInit: RequestInit = { method, headers };

    if (method !== 'GET' && bodyData) {
      requestInit.body = bodyData instanceof FormData ? bodyData : JSON.stringify(bodyData);
      if (!(bodyData instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
    }

    try {
      const response = await fetch(url, requestInit);
      const result = await response.json();

      setData(result);

      // แสดง Alert ถ้ามีการกำหนดค่า alert เป็น true
      if (options.alert && result.message && result.description && result.status) {
        showAlert({
          message: result.message,
          description: result.description,
          type: mapStatusToAlertType(result.status),
        });
      }

      // แสดง Notification Modal ถ้ามีการกำหนดค่า notificationModal และมีข้อมูลผลลัพธ์
      if (options.notificationModal) {
        const title = options.notificationModal.title || (result.message || 'การทำงานเสร็จสิ้น');
        const content = options.notificationModal.content || (result.description || 'การดำเนินการเสร็จสิ้นแล้ว');
        const duration = options.notificationModal.duration || 5000;
        
        showNotificationModal(title, content, duration);
      }
      
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(err.message || 'Request failed');
      setError(errorObj);

      // แสดง Alert กรณีเกิด Error
      if (options.alert) {
        showAlert({
          message: 'เกิดข้อผิดพลาด',
          description: errorObj.message,
          type: 'error',
        });
      }

      // แสดง Notification Modal กรณีเกิด Error
      if (options.notificationModal) {
        showNotificationModal(
          'เกิดข้อผิดพลาด',
          errorObj.message,
          options.notificationModal.duration || 5000
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const trigger = useCallback(async () => {
    // ถ้ามีการกำหนดค่า confirmModal ให้แสดง Modal ยืนยันก่อนทำการยิง API
    if (options.confirmModal) {
      showConfirmModal(
        options.confirmModal.title,
        options.confirmModal.content,
        executeRequest
      );
    } else {
      // ถ้าไม่มีการกำหนดค่า confirmModal ให้ทำการยิง API เลย
      await executeRequest();
    }
  }, [method, url, bodyData, options, showAlert, showConfirmModal]);

  useEffect(() => {
    if (options.immediate) {
      trigger();
    }
  }, [options.immediate, trigger]);

  return { data, loading, error, trigger };
};

export default useFetch;
