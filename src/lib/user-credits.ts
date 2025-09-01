export interface UserCredits {
  userId: string;
  email: string;
  thumbnailsRemaining: number;
  regeneratesRemaining: number;
  isAdmin: boolean;
  hasUsedFreePreview: boolean; // Track if user has used their free preview
  lastUpdated: Date;
}

// In-memory storage (server-side)
const userCreditsStore = new Map<string, UserCredits>();

// Admin email
const ADMIN_EMAIL = 'aarif.mohammad0909@gmail.com';

export class UserCreditsManager {
  static async getUserCredits(userId: string, email: string): Promise<UserCredits> {
    // Check if user exists in store
    if (userCreditsStore.has(userId)) {
      const existingUser = userCreditsStore.get(userId)!;
      
      // Check if email matches admin email and update admin status if needed
console.log("canGenerate-------", existingUser)

      const isAdmin = email === ADMIN_EMAIL;
      if (existingUser.isAdmin !== isAdmin) {
        // Update admin status
        const updatedCredits: UserCredits = {
          ...existingUser,
          email,
          isAdmin,
          thumbnailsRemaining: isAdmin ? 999999 : existingUser.thumbnailsRemaining,
          regeneratesRemaining: isAdmin ? 999999 : existingUser.regeneratesRemaining,
          lastUpdated: new Date(),
        };
            userCreditsStore.set(userId, updatedCredits);
    return updatedCredits;
      }
      
      return existingUser;
    }

    // Create new user with default credits
    const isAdmin = email === ADMIN_EMAIL;
    const defaultCredits: UserCredits = {
      userId,
      email,
      thumbnailsRemaining: isAdmin ? 999999 : 0, // Admin gets unlimited
      regeneratesRemaining: isAdmin ? 999999 : 0, // Admin gets unlimited
      isAdmin,
      hasUsedFreePreview: false, // New users get one free preview
      lastUpdated: new Date(),
    };

    userCreditsStore.set(userId, defaultCredits);
    return defaultCredits;
  }

  static async addCredits(userId: string, thumbnails: number, regenerates: number): Promise<UserCredits> {
    const user = userCreditsStore.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedCredits: UserCredits = {
      ...user,
      thumbnailsRemaining: user.thumbnailsRemaining + thumbnails,
      regeneratesRemaining: user.regeneratesRemaining + regenerates,
      lastUpdated: new Date(),
    };

    userCreditsStore.set(userId, updatedCredits);
    return updatedCredits;
  }

  static async useThumbnail(userId: string): Promise<{ success: boolean; credits: UserCredits; message?: string }> {
    const user = userCreditsStore.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isAdmin) {
      // Admin has unlimited access
      return { success: true, credits: user };
    }

    if (user.thumbnailsRemaining <= 0) {
      return { 
        success: false, 
        credits: user, 
        message: 'No thumbnails remaining. Please purchase more credits.' 
      };
    }

    const updatedCredits: UserCredits = {
      ...user,
      thumbnailsRemaining: user.thumbnailsRemaining - 1,
      lastUpdated: new Date(),
    };

    userCreditsStore.set(userId, updatedCredits);
    
    return { success: true, credits: updatedCredits };
  }

  static async useRegenerate(userId: string): Promise<{ success: boolean; credits: UserCredits; message?: string }> {
    const user = userCreditsStore.get(userId);
    console.log("user---", user)
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isAdmin) {
      // Admin has unlimited access
      return { success: true, credits: user };
    }

    if (user.regeneratesRemaining <= 0) {
      return { 
        success: false, 
        credits: user, 
        message: 'No regenerates remaining. Please purchase more credits.' 
      };
    }

    const updatedCredits: UserCredits = {
      ...user,
      regeneratesRemaining: user.regeneratesRemaining - 1,
      lastUpdated: new Date(),
    };

    userCreditsStore.set(userId, updatedCredits);
    
    return { success: true, credits: updatedCredits };
  }

  static async isAdmin(email: string): Promise<boolean> {
    return email === ADMIN_EMAIL;
  }

  // Check if user can generate a free preview
  static async canGenerateFreePreview(userId: string): Promise<{ canGenerate: boolean; credits: UserCredits; message?: string }> {
    const user = userCreditsStore.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isAdmin) {
      return { canGenerate: true, credits: user };
    }

    if (!user.hasUsedFreePreview) {
      return { canGenerate: true, credits: user };
    }

    if (user.thumbnailsRemaining > 0) {
      return { canGenerate: true, credits: user };
    }

    return { 
      canGenerate: false, 
      credits: user, 
      message: 'You\'ve used your free preview. Please purchase credits to generate more thumbnails.' 
    };
  }

  // Mark free preview as used
  static async useFreePreview(userId: string): Promise<{ success: boolean; credits: UserCredits; message?: string }> {
    const user = userCreditsStore.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isAdmin) {
      return { success: true, credits: user };
    }

    if (user.hasUsedFreePreview) {
      return { 
        success: false, 
        credits: user, 
        message: 'You\'ve already used your free preview. Please purchase credits.' 
      };
    }

    const updatedCredits: UserCredits = {
      ...user,
      hasUsedFreePreview: true,
      lastUpdated: new Date(),
    };

    userCreditsStore.set(userId, updatedCredits);
    
    return { success: true, credits: updatedCredits };
  }

  // Check if user can download (requires credits)
  static async canDownload(userId: string): Promise<{ canDownload: boolean; credits: UserCredits; message?: string }> {
    const user = userCreditsStore.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isAdmin) {
      return { canDownload: true, credits: user };
    }

    if (user.thumbnailsRemaining > 0) {
      return { canDownload: true, credits: user };
    }

    return { 
      canDownload: false, 
      credits: user, 
      message: 'No credits remaining for download. Please purchase more credits.' 
    };
  }

  // Force reset user admin status (for debugging)
  static async forceResetUser(userId: string, email: string): Promise<UserCredits> {
    const isAdmin = email === ADMIN_EMAIL;
    const updatedCredits: UserCredits = {
      userId,
      email,
      thumbnailsRemaining: isAdmin ? 999999 : 0,
      regeneratesRemaining: isAdmin ? 999999 : 0,
      isAdmin,
      hasUsedFreePreview: false,
      lastUpdated: new Date(),
    };

    userCreditsStore.set(userId, updatedCredits);
    return updatedCredits;
  }



  // Clear all user data (for debugging)
  static clearAllUsers(): void {
    userCreditsStore.clear();
    console.log('All user data cleared');
  }

  // Force create fresh admin user
  static async forceCreateAdmin(userId: string, email: string): Promise<UserCredits> {
    // Clear existing user data first
    userCreditsStore.delete(userId);
    
    const isAdmin = email === ADMIN_EMAIL;
    const adminCredits: UserCredits = {
      userId,
      email,
      thumbnailsRemaining: isAdmin ? 999999 : 0,
      regeneratesRemaining: isAdmin ? 999999 : 0,
      isAdmin,
      hasUsedFreePreview: false,
      lastUpdated: new Date(),
    };

    userCreditsStore.set(userId, adminCredits);
    
    console.log(`Fresh admin user created: ${email}, isAdmin: ${isAdmin}`);
    return adminCredits;
  }

  // For debugging purposes
  static getAllUsers(): UserCredits[] {
    return Array.from(userCreditsStore.values());
  }
}
