
export interface Moment {
  id: string;
  title: string;
  note: string;
  date: Date;
  photo?: string;
  user_id: string;
  is_featured: boolean;
}

export type CreateMomentData = Omit<Moment, 'id' | 'user_id' | 'is_featured'>;
