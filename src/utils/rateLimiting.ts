
interface AttemptRecord {
  count: number;
  lastAttempt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly blockDurationMs = 30 * 60 * 1000; // 30 minutes

  isBlocked(identifier: string): boolean {
    const record = this.attempts.get(identifier);
    if (!record) return false;

    const now = Date.now();
    
    // Check if still blocked
    if (record.blockedUntil && record.blockedUntil > now) {
      return true;
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.delete(identifier);
      return false;
    }

    return false;
  }

  recordAttempt(identifier: string): { blocked: boolean; remainingAttempts: number } {
    const now = Date.now();
    const record = this.attempts.get(identifier) || { count: 0, lastAttempt: 0 };

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      record.count = 0;
    }

    record.count++;
    record.lastAttempt = now;

    // Block if max attempts reached
    if (record.count >= this.maxAttempts) {
      record.blockedUntil = now + this.blockDurationMs;
      this.attempts.set(identifier, record);
      return { blocked: true, remainingAttempts: 0 };
    }

    this.attempts.set(identifier, record);
    return { 
      blocked: false, 
      remainingAttempts: this.maxAttempts - record.count 
    };
  }

  getRemainingBlockTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record?.blockedUntil) return 0;

    const remaining = record.blockedUntil - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000 / 60)); // minutes
  }
}

export const authRateLimiter = new RateLimiter();
