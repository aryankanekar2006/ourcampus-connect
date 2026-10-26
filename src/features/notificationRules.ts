type NotificationRecord = {
  targetRole?: string | null;
  targetAudience?: string | null;
  recipientEmail?: string | null;
};

type NotificationUser = {
  role: string;
  email: string;
  studentClass?: string | null;
};

export const isNotificationVisibleToUser = (
  notification: NotificationRecord | null | undefined,
  user: NotificationUser | null | undefined
) => {
  if (!notification || typeof notification !== 'object' || !user || typeof user !== 'object') return false;

  const role = notification.targetRole?.trim().toLowerCase();
  const audience = notification.targetAudience?.trim().toLowerCase();
  const recipientEmail = notification.recipientEmail?.trim().toLowerCase();
  const userRole = typeof user.role === 'string' ? user.role.trim().toLowerCase() : '';
  const userEmail = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
  const userClass = typeof user.studentClass === 'string' ? user.studentClass.trim().toLowerCase() : '';

  return (!role || role === 'all' || role === 'everyone' || role === userRole) &&
    (userRole !== 'student' || !audience || audience === 'everyone' ||
      audience === userClass) &&
    (!recipientEmail || recipientEmail === userEmail);
};
