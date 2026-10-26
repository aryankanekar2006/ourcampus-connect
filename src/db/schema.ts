import { boolean, integer, pgTable, primaryKey, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users Table (Students, Teachers, Principal)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(), // Firebase Auth UID if logged via Firebase
  role: text('role').notNull(), // 'student' | 'teacher' | 'admin'
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  passwordHash: text('password_hash'),
  rollNo: text('roll_no'),
  facultyId: text('faculty_id'),
  adminId: text('admin_id'),
  studentClass: text('student_class'),
  stream: text('stream'),
  department: text('department'),
  adminRole: text('admin_role'), // 'Principal'
  phone: text('phone'),
  avatar: text('avatar'),
  isVerified: boolean('is_verified').default(false), // For faculty access verification by Principal
  verificationStatus: text('verification_status').default('approved'), // 'pending' | 'approved' | 'rejected' | 'revoked'
  createdAt: timestamp('created_at').defaultNow()
});

export const authSessions = pgTable('auth_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// 2. Events & Seminars Table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  type: text('type').notNull().default('event'), // 'event' | 'seminar'
  programmeType: text('programme_type'), // For seminars: 'Seminar' | 'Workshop' | 'Awareness Program'
  title: text('title').notNull(),
  subHeadline: text('sub_headline'), // Event tagline or seminar theme
  category: text('category').notNull(), // 'Technical', 'Cultural', 'Sports', 'Academic', etc.
  department: text('department').notNull(),
  dateMode: text('date_mode').default('single'), // 'single' | 'range' | 'multiple'
  date: text('date').notNull(), // Start date or single date
  endDate: text('end_date'), // End date if date range
  multipleDates: text('multiple_dates'), // Serialized dates if multiple individual dates
  time: text('time').notNull(),
  venue: text('venue').notNull(),
  description: text('description').notNull(),
  highlights: text('highlights'), // Serialized highlights / attractions
  resourcePerson: text('resource_person'), // For seminars: Guest speaker / Resource person
  forWhom: text('for_whom'), // Target description
  prizes: text('prizes'), // Optional prizes / awards
  contact: text('contact'),
  socialHandle: text('social_handle'),
  image: text('image'),
  collegeLogo: text('college_logo'),
  deptLogo: text('dept_logo'),
  maxSeats: integer('max_seats').default(100),
  registrationEnabled: boolean('registration_enabled').default(false),
  ticketPrice: text('ticket_price'),
  eligibility: text('eligibility'),
  registrationDeadline: text('registration_deadline'),
  externalRegistrationUrl: text('external_registration_url'),
  qrCodeUrl: text('qr_code_url'),
  targetAudience: text('target_audience').default('Everyone'), // 'Everyone' | 'FYCS' | 'SYCS' | 'TYCS' etc.
  attendanceEnabled: boolean('attendance_enabled').default(false),
  status: text('status').default('pending_approval'), // 'draft' | 'pending_approval' | 'changes_requested' | 'approved' | 'rejected' | 'cancelled'
  principalMessage: text('principal_message'), // Feedback / revision message from Principal
  flyerData: text('flyer_data'), // AI Generated flyer data (headlines, designTheme, schedules)
  flyerVersions: text('flyer_versions'), // JSON array of generated flyer variations
  selectedFlyerImage: text('selected_flyer_image'), // Final rendered flyer image URL / Base64
  proposedFlyerImage: text('proposed_flyer_image'),
  approvedFlyerImage: text('approved_flyer_image'),
  proposedCoverImage: text('proposed_cover_image'),
  approvedCoverImage: text('approved_cover_image'),
  flyerReviewStatus: text('flyer_review_status').default('not_submitted'),
  coverReviewStatus: text('cover_review_status').default('not_submitted'),
  flyerReviewMessage: text('flyer_review_message'),
  createdBy: text('created_by'),
  creatorEmail: text('creator_email'),
  creatorName: text('creator_name'),
  createdAt: timestamp('created_at').defaultNow()
});

// 3. Registrations Table
export const registrations = pgTable('registrations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull(),
  userEmail: text('user_email').notNull(),
  userName: text('user_name').notNull(),
  rollNo: text('roll_no'),
  studentClass: text('student_class'),
  registeredAt: timestamp('registered_at').defaultNow()
});

// 4. Volunteers Table
export const volunteers = pgTable('volunteers', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull(),
  userEmail: text('user_email').notNull(),
  userName: text('user_name').notNull(),
  roleApplied: text('role_applied').notNull(),
  reason: text('reason'),
  skills: text('skills'),
  status: text('status').default('Pending'),
  appliedAt: timestamp('applied_at').defaultNow()
});

// 5. Attendance Sessions Table (OTP code expires in 15-20 seconds)
export const attendanceSessions = pgTable('attendance_sessions', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull(),
  code: text('code').notNull(), // 4-digit numeric OTP
  expiresAt: timestamp('expires_at').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// 6. Attendance Requests Table
export const attendanceRequests = pgTable('attendance_requests', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id'),
  eventId: integer('event_id').notNull(),
  userEmail: text('user_email').notNull(),
  userName: text('user_name').notNull(),
  rollNo: text('roll_no'),
  studentClass: text('student_class'),
  status: text('status').default('Pending'), // 'Pending' | 'Present' | 'Rejected'
  submittedAt: timestamp('submitted_at').defaultNow(),
  approvedAt: timestamp('approved_at')
});

// 7. Messaging System (Principal <-> Faculty, Student -> Faculty)
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // 'principal_faculty' | 'student_faculty'
  senderEmail: text('sender_email').notNull(),
  senderName: text('sender_name').notNull(),
  senderRole: text('sender_role').notNull(),
  recipientEmail: text('recipient_email').notNull(),
  recipientName: text('recipient_name'),
  eventId: integer('event_id'),
  eventTitle: text('event_title'),
  subject: text('subject'),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// 8. Notifications Table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  targetRole: text('target_role').default('all'), // 'all' | 'student' | 'teacher' | 'admin'
  targetAudience: text('target_audience').default('Everyone'), // 'Everyone' | 'FYCS' etc.
  recipientEmail: text('recipient_email'),
  eventId: integer('event_id'),
  createdAt: timestamp('created_at').defaultNow()
});

export const notificationReads = pgTable('notification_reads', {
  notificationId: integer('notification_id').notNull().references(() => notifications.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  readAt: timestamp('read_at').notNull().defaultNow()
}, (table) => [
  primaryKey({ columns: [table.notificationId, table.userId] })
]);

// 9. Feedbacks Table
export const feedbacks = pgTable('feedbacks', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id'),
  userEmail: text('user_email').notNull(),
  userName: text('user_name').notNull(),
  eventTitle: text('event_title').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow()
});
