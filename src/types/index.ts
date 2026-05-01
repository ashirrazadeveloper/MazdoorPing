export type UserRole = 'worker' | 'employer' | 'admin';
export type WorkerStatus = 'pending' | 'active' | 'rejected' | 'suspended';
export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type BidStatus = 'pending' | 'accepted' | 'rejected';
export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type NotificationType = 'job' | 'bid' | 'payment' | 'verification' | 'sos' | 'system';
export type SOSStatus = 'active' | 'resolved' | 'dismissed';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Worker {
  id: string;
  user_id: string;
  profile_id: string;
  cnic_number: string;
  cnic_front_url: string;
  cnic_back_url: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  province: string;
  bio: string;
  status: WorkerStatus;
  rating: number;
  total_reviews: number;
  completed_jobs: number;
  hourly_rate: number;
  availability: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  skills?: WorkerSkill[];
}

export interface Employer {
  id: string;
  user_id: string;
  profile_id: string;
  company_name: string;
  company_type: string;
  business_address: string;
  city: string;
  province: string;
  phone_office: string;
  bio: string;
  total_posted_jobs: number;
  total_spent: number;
  rating: number;
  total_reviews: number;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Category {
  id: string;
  name: string;
  name_ur: string;
  icon: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface WorkerSkill {
  id: string;
  worker_id: string;
  category_id: string;
  category?: Category;
  experience_years: number;
  is_primary: boolean;
}

export interface Job {
  id: string;
  employer_id: string;
  category_id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  budget_type: 'fixed' | 'hourly';
  city: string;
  province: string;
  address: string;
  status: JobStatus;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  duration_days: number;
  workers_needed: number;
  requirements: string[];
  is_featured: boolean;
  views_count: number;
  bids_count: number;
  created_at: string;
  updated_at: string;
  employer?: Employer;
  category?: Category;
  bids?: Bid[];
}

export interface Bid {
  id: string;
  job_id: string;
  worker_id: string;
  amount: number;
  message: string;
  estimated_days: number;
  status: BidStatus;
  created_at: string;
  updated_at: string;
  worker?: Worker;
  job?: Job;
}

export interface Transaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  job_id: string | null;
  bid_id: string | null;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  created_at: string;
  from_profile?: Profile;
  to_profile?: Profile;
}

export interface Wallet {
  balance: number;
  total_earned: number;
  total_spent: number;
  pending_withdrawals: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  from_user_id: string;
  to_user_id: string;
  job_id: string;
  rating: number;
  comment: string;
  created_at: string;
  from_profile?: Profile;
  to_profile?: Profile;
}

export interface SavedWorker {
  id: string;
  employer_id: string;
  worker_id: string;
  created_at: string;
  worker?: Worker;
}

export interface SOSAlert {
  id: string;
  worker_id: string;
  job_id: string | null;
  latitude: number;
  longitude: number;
  message: string;
  status: SOSStatus;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  worker?: Worker;
}

export interface Withdrawal {
  id: string;
  worker_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_title: string;
  status: WithdrawalStatus;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
  worker?: Worker;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface VerificationLog {
  id: string;
  worker_id: string;
  admin_id: string;
  action: 'approve' | 'reject' | 'suspend';
  reason: string;
  created_at: string;
  admin?: Profile;
  worker?: Worker;
}

export interface DashboardStats {
  totalWorkers: number;
  activeWorkers: number;
  pendingVerifications: number;
  totalEmployers: number;
  totalJobs: number;
  openJobs: number;
  completedJobs: number;
  totalRevenue: number;
  activeSOS: number;
}
