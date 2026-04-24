import { Hono } from 'hono';
import { clerkAuthMiddleware } from '../middlewares/auth.middleware';
import { verifyToken, createClerkClient } from '@clerk/backend';
import { User } from '../models/User';

const authRoutes = new Hono();

authRoutes.get('/me', clerkAuthMiddleware, async (c) => {
  const userId = c.get('userId');

  try {
    let userDoc = await User.findOne({ clerk_id: userId });
    let role: string;

    // Always check Clerk first for the authoritative role
    try {
      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const clerkUser = await clerk.users.getUser(userId).catch(() => null);
      const publicMetadata = clerkUser?.publicMetadata as any;
      const clerkRole = publicMetadata?.role as string | undefined;
      
      console.log('[Auth] Clerk role:', clerkRole);
      
      if (clerkRole) {
        role = clerkRole;
      } else if (userDoc?.role) {
        role = userDoc.role;
      } else {
        role = 'user';
      }
    } catch (err) {
      console.error('[Auth] Clerk API error:', err);
      role = userDoc?.role || 'user';
    }

    // Sync role to MongoDB if needed
    if (userDoc && userDoc.role !== role) {
      await User.updateOne({ clerk_id: userId }, { role });
      console.log('[Auth] Updated user role to:', role);
    }

    // If user doesn't exist in MongoDB, create them
    if (!userDoc) {
      try {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerkUser = await clerk.users.getUser(userId).catch(() => null);
        
        const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
        
        if (email) {
          await User.create({
            clerk_id: userId,
            email: email,
            role: role
          });
          console.log(`[Auth] Created user ${email} with role: ${role}`);
        }
      } catch (err) {
        console.error('[Auth] Error creating user:', err);
      }
    }

    return c.json({
      userId,
      role: role || 'user',
      isAdmin: role === 'admin'
    });
  } catch (error) {
    console.error('[Auth/Me Error]:', error);
    return c.json({ userId, role: 'user', isAdmin: false }, 200);
  }
});

export default authRoutes;