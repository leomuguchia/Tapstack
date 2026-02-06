import React from 'react';
import Toast from './Toast';

const ToastManager = ({ toast, onHide }) => {
  if (!toast) return null;

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onHide={onHide}
    />
  );
};

export default ToastManager;