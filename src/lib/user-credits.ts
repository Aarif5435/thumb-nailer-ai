import { prisma } from './prisma';

export interface UserCredits {
  id: string;
  userId: string;
  email: string;
  thumbnailsRemaining: number;
  regeneratesRemaining: number;
  isAdmin: boolean;
  hasUsedFreePreview: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Admin email
const ADMIN_EMAIL = 'aarif.mohammad0909@gmail.com';

export class UserCreditsManager {
  static async getUserCredits(userId: string, email: string): Promise<UserCredits> {
    try {
      // Check if user exists in database
      let user = await prisma.userCredits.findUnique({
        where: { userId }
      });

      const isAdmin = email === ADMIN_EMAIL;

      if (user) {
        // Update admin status if needed
        if (user.isAdmin !== isAdmin) {
          user = await prisma.userCredits.update({
            where: { userId },
            data: {
              email,
              isAdmin,
              thumbnailsRemaining: isAdmin ? 999999 : user.thumbnailsRemaining,
              regeneratesRemaining: isAdmin ? 999999 : user.regeneratesRemaining,
              lastUpdated: new Date(),
            }
          });
        }
        return user;
      }

      // Create new user with default credits
      const defaultCredits = await prisma.userCredits.create({
        data: {
          userId,
          email,
          thumbnailsRemaining: isAdmin ? 999999 : 0,
          regeneratesRemaining: isAdmin ? 999999 : 0,
          isAdmin,
          hasUsedFreePreview: false,
          lastUpdated: new Date(),
        }
      });

      console.log(`New user created: ${email}, isAdmin: ${isAdmin}`);
      return defaultCredits;
    } catch (error) {
      console.error('Error in getUserCredits:', error);
      throw error;
    }
  }

  static async addCredits(userId: string, thumbnails: number, regenerates: number): Promise<UserCredits> {
    try {
      const user = await prisma.userCredits.findUnique({
        where: { userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const updatedCredits = await prisma.userCredits.update({
        where: { userId },
        data: {
          thumbnailsRemaining: user.thumbnailsRemaining + thumbnails,
          regeneratesRemaining: user.regeneratesRemaining + regenerates,
          lastUpdated: new Date(),
        }
      });

      return updatedCredits;
    } catch (error) {
      console.error('Error in addCredits:', error);
      throw error;
    }
  }

  static async useThumbnail(userId: string): Promise<{ success: boolean; credits: UserCredits; message?: string }> {
    try {
      const user = await prisma.userCredits.findUnique({
        where: { userId }
      });

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

      const updatedCredits = await prisma.userCredits.update({
        where: { userId },
        data: {
          thumbnailsRemaining: user.thumbnailsRemaining - 1,
          lastUpdated: new Date(),
        }
      });

      return { success: true, credits: updatedCredits };
    } catch (error) {
      console.error('Error in useThumbnail:', error);
      throw error;
    }
  }

  static async useRegenerate(userId: string): Promise<{ success: boolean; credits: UserCredits; message?: string }> {
    try {
      const user = await prisma.userCredits.findUnique({
        where: { userId }
      });



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

      const updatedCredits = await prisma.userCredits.update({
        where: { userId },
        data: {
          regeneratesRemaining: user.regeneratesRemaining - 1,
          lastUpdated: new Date(),
        }
      });

      return { success: true, credits: updatedCredits };
    } catch (error) {
      console.error('Error in useRegenerate:', error);
      throw error;
    }
  }

  static async isAdmin(email: string): Promise<boolean> {
    return email === ADMIN_EMAIL;
  }

  // Check if user can generate a free preview
  static async canGenerateFreePreview(userId: string): Promise<{ canGenerate: boolean; credits: UserCredits; message?: string }> {
    try {
      const user = await prisma.userCredits.findUnique({
        where: { userId }
      });

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
    } catch (error) {
      console.error('Error in canGenerateFreePreview:', error);
      throw error;
    }
  }

  // Mark free preview as used
  static async useFreePreview(userId: string): Promise<{ success: boolean; credits: UserCredits; message?: string }> {
    try {
      const user = await prisma.userCredits.findUnique({
        where: { userId }
      });

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

      const updatedCredits = await prisma.userCredits.update({
        where: { userId },
        data: {
          hasUsedFreePreview: true,
          lastUpdated: new Date(),
        }
      });

      return { success: true, credits: updatedCredits };
    } catch (error) {
      console.error('Error in useFreePreview:', error);
      throw error;
    }
  }

  // Check if user can download (requires credits)
  static async canDownload(userId: string): Promise<{ canDownload: boolean; credits: UserCredits; message?: string }> {
    try {
      const user = await prisma.userCredits.findUnique({
        where: { userId }
      });

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
    } catch (error) {
      console.error('Error in canDownload:', error);
      throw error;
    }
  }

  // Force create fresh admin user (preserve existing credits)
  static async forceCreateAdmin(userId: string, email: string): Promise<UserCredits> {
    try {
      const isAdmin = email === ADMIN_EMAIL;
      
      // Check if user already exists
      const existingUser = await prisma.userCredits.findUnique({
        where: { userId }
      });

      if (existingUser) {
        // Update admin status and set admin credits
        const updatedUser = await prisma.userCredits.update({
          where: { userId },
          data: {
            isAdmin,
            email, // Update email in case it changed
            thumbnailsRemaining: isAdmin ? 999999 : existingUser.thumbnailsRemaining,
            regeneratesRemaining: isAdmin ? 999999 : existingUser.regeneratesRemaining,
            lastUpdated: new Date(),
          }
        });
        console.log(`Updated existing user: ${email}, isAdmin: ${isAdmin}`);
        return updatedUser;
      }

      // Create new user if doesn't exist
      const adminCredits = await prisma.userCredits.create({
        data: {
          userId,
          email,
          thumbnailsRemaining: isAdmin ? 999999 : 0,
          regeneratesRemaining: isAdmin ? 999999 : 0,
          isAdmin,
          hasUsedFreePreview: false,
          lastUpdated: new Date(),
        }
      });

      console.log(`Fresh admin user created: ${email}, isAdmin: ${isAdmin}`);
      return adminCredits;
    } catch (error) {
      console.error('Error in forceCreateAdmin:', error);
      throw error;
    }
  }

  // Clear all user data (for debugging)
  static async clearAllUsers(): Promise<void> {
    try {
      await prisma.userCredits.deleteMany({});
      console.log('All user data cleared');
    } catch (error) {
      console.error('Error in clearAllUsers:', error);
      throw error;
    }
  }

  // For debugging purposes
  static async getAllUsers(): Promise<UserCredits[]> {
    try {
      return await prisma.userCredits.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }
}
