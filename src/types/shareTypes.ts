
export interface SharedMomentWithDetails {
  moment_id: string;
  moment_title: string;
  moment_note: string;
  moment_date: string;
  moment_photo: string | null;
  shared_by_name: string | null;
  shared_by_email: string | null;
}
