
import { SharedMoment, CreateSharedMomentData } from '@/types/sharedMoment';
import { Moment } from '@/types/moment';
import { ShareOperations } from './shareOperations';
import { SharedMomentRetrieval } from './sharedMomentRetrieval';

export class ShareService {
  static async createShare(userId: string, shareData: CreateSharedMomentData, senderName?: string): Promise<SharedMoment | null> {
    return ShareOperations.createShare(userId, shareData, senderName);
  }

  static async getSharedMoment(shareToken: string): Promise<{ moment: Moment; sharedBy: string } | null> {
    return SharedMomentRetrieval.getSharedMoment(shareToken);
  }

  static async getUserShares(userId: string): Promise<SharedMoment[]> {
    return SharedMomentRetrieval.getUserShares(userId);
  }

  static async deleteShare(userId: string, shareId: string): Promise<boolean> {
    return ShareOperations.deleteShare(userId, shareId);
  }
}
