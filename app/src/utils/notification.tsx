import React from 'react';
import { notification } from 'antd';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const pushNotification = (message: NotificationType, description: string) => {
  notification[message]({
    message,
    description
  });
};