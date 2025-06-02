
export interface SharedMoment {
  id: string;
  moment_id: string;
  shared_by_user_id: string;
  shared_with_email: string;
  share_token: string;
  created_at: string;
  expires_at: string | null;
}

export type CreateSharedMomentData = {
  moment_id: string;
  shared_with_email: string;
};
