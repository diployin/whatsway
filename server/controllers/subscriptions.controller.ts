import { Request, Response } from 'express';
import { db } from '../db';
import { subscriptions, users, plans } from '@shared/schema';
import { eq, and, desc, lt, gte, sql } from 'drizzle-orm';

// Get all subscriptions
// export const getAllSubscriptions = async (req: Request, res: Response) => {
//   try {
//     const allSubscriptions = await db
//       .select({
//         subscription: subscriptions,
//         user: {
//           id: users.id,
//           username: users.username, // only username
//         },
//         plan: {
//           id: plans.id,
//           name: plans.name,
//           description: plans.description,
//           icon: plans.icon,
//           monthlyPrice: plans.monthlyPrice,
//           annualPrice: plans.annualPrice,
//           features: plans.features,
//           permissions: plans.permissions
//         }
//       })
//       .from(subscriptions)
//       .leftJoin(users, eq(subscriptions.userId, users.id))
//       .leftJoin(plans, eq(subscriptions.planId, plans.id))
//       .orderBy(desc(subscriptions.createdAt));

//     res.status(200).json({ success: true, data: allSubscriptions });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching subscriptions', error });
//   }
// };


export const getAllSubscriptions = async (req: Request, res: Response) => {
  try {
    // --- 1️⃣ Read page & limit from query ---
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // --- 2️⃣ Count total subscriptions ---
    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(subscriptions);

    const total = Number(count);
    const totalPages = Math.ceil(total / limit);

    // --- 3️⃣ Fetch paginated results ---
    const paginatedSubscriptions = await db
      .select({
        subscription: subscriptions,
        user: {
          id: users.id,
          username: users.username,
        },
        plan: {
          id: plans.id,
          name: plans.name,
          description: plans.description,
          icon: plans.icon,
          monthlyPrice: plans.monthlyPrice,
          annualPrice: plans.annualPrice,
          features: plans.features,
          permissions: plans.permissions,
        },
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .leftJoin(plans, eq(subscriptions.planId, plans.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(limit)
      .offset(offset);

    // --- 4️⃣ Send response ---
    res.status(200).json({
      success: true,
      data: paginatedSubscriptions,
      pagination: {
        total,
        totalPages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subscriptions",
      error,
    });
  }
};



export const getActivePaidUsersCount = async () => {
  const activeSubs = await db
    .select({ userId: subscriptions.userId })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));

  return new Set(activeSubs.map(s => s.userId)).size;
};



// Get subscription by ID
export const getSubscriptionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subscription = await db
      .select({
        subscription: subscriptions,
        user: users,
        plan: plans
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .leftJoin(plans, eq(subscriptions.planId, plans.id))
      .where(eq(subscriptions.id, id));

    if (subscription.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.status(200).json({ success: true, data: subscription[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching subscription', error });
  }
};

// Get subscriptions by user ID
export const getSubscriptionsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userSubscriptions = await db
      .select({
        subscription: subscriptions,
        user: {
          id: users.id,
          username: users.username, // select username
        }
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));

    res.status(200).json({ success: true, data: userSubscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user subscriptions', error });
  }
};




// Get active subscription by user ID
export const getActiveSubscriptionByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const activeSubscription = await db
      .select({
        subscription: subscriptions,
        plan: plans
      })
      .from(subscriptions)
      .leftJoin(plans, eq(subscriptions.planId, plans.id))
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        )
      )
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (activeSubscription.length === 0) {
      return res.status(404).json({ success: false, message: 'No active subscription found' });
    }

    res.status(200).json({ success: true, data: activeSubscription[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching active subscription', error });
  }
};

// Create subscription (usually done through transaction completion)
export const createSubscription = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      planId,
      billingCycle,
      startDate,
      endDate,
      autoRenew
    } = req.body;

    const newSubscription = await db
      .insert(subscriptions)
      .values({
        userId,
        planId,
        status: 'active',
        billingCycle,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        autoRenew: autoRenew ?? true
      })
      .returning();

    res.status(201).json({ 
      success: true, 
      message: 'Subscription created successfully',
      data: newSubscription[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating subscription', error });
  }
};

// Update subscription
export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedSubscription = await db
      .update(subscriptions)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();

    if (updatedSubscription.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Subscription updated successfully',
      data: updatedSubscription[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating subscription', error });
  }
};

// Cancel subscription
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cancelledSubscription = await db
      .update(subscriptions)
      .set({ 
        status: 'cancelled',
        autoRenew: false,
        updatedAt: new Date() 
      })
      .where(eq(subscriptions.id, id))
      .returning();

    if (cancelledSubscription.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Subscription cancelled successfully',
      data: cancelledSubscription[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelling subscription', error });
  }
};

// Renew subscription
export const renewSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get current subscription
    const currentSub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));

    if (currentSub.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const subscription = currentSub[0];

    // Calculate new end date
    const newStartDate = new Date();
    const newEndDate = new Date();

    if (subscription.billingCycle === 'annual') {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    } else {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    }

    const renewedSubscription = await db
      .update(subscriptions)
      .set({
        status: 'active',
        startDate: newStartDate,
        endDate: newEndDate,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, id))
      .returning();

    res.status(200).json({ 
      success: true, 
      message: 'Subscription renewed successfully',
      data: renewedSubscription[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error renewing subscription', error });
  }
};

// Toggle auto-renew
export const toggleAutoRenew = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { autoRenew } = req.body;

    const updatedSubscription = await db
      .update(subscriptions)
      .set({ autoRenew, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();

    if (updatedSubscription.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: `Auto-renew ${autoRenew ? 'enabled' : 'disabled'} successfully`,
      data: updatedSubscription[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling auto-renew', error });
  }
};

// Check and update expired subscriptions
export const checkExpiredSubscriptions = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const expiredSubscriptions = await db
      .update(subscriptions)
      .set({ status: 'expired', updatedAt: new Date() })
      .where(
        and(
          eq(subscriptions.status, 'active'),
          lt(subscriptions.endDate, now)
        )
      )
      .returning();

    res.status(200).json({ 
      success: true, 
      message: `${expiredSubscriptions.length} subscriptions marked as expired`,
      data: expiredSubscriptions 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking expired subscriptions', error });
  }
};