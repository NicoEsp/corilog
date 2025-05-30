
export interface Moment {
  id: string;
  title: string;
  note: string;
  date: Date;
  photo?: string;
  user_id: string;
}

export type CreateMomentData = Omit<Moment, 'id' | 'user_id'>;
