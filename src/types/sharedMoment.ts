export interface SharedMoment {
  id: string;
  moment_id: string;
  shared_by_user_id: string;
  share_token: string;
  recipient_email_1: string;
  recipient_email_2?: string;
  expires_at?: string;
  view_count_email_1: number;
  view_count_email_2: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSharedMomentData {
  moment_id: string;
  recipient_email_1: string;
  recipient_email_2?: string;
  expires_at?: Date;
}

export interface SharedMomentAccess {
  moment: {
    id: string;
    title: string;
    note: string;
    date: string;
    photo?: string;
  };
  sharedBy: string;
  isValid: boolean;
  error?: string;
}