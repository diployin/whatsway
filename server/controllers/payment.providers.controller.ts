import { Request, Response } from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { paymentProviders } from '@shared/schema';

// Get all payment providers
export const getAllProviders = async (req: Request, res: Response) => {
  try {
    const providers = await db.select().from(paymentProviders);
    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching providers', error });
  }
};

// Get active payment providers only
export const getActiveProviders = async (req: Request, res: Response) => {
  try {
    const providers = await db
      .select({
        id: paymentProviders.id,
        name: paymentProviders.name,
        providerKey: paymentProviders.providerKey,
        logo: paymentProviders.logo,
      })
      .from(paymentProviders)
      .where(eq(paymentProviders.isActive, true));

    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching active providers",
      error,
    });
  }
};

// Get single payment provider by ID
export const getProviderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const provider = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.id, id));
    
    if (provider.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    
    res.status(200).json({ success: true, data: provider[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching provider', error });
  }
};

// Get provider by key (e.g., "razorpay", "stripe")
export const getProviderByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const provider = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.providerKey, key));
    
    if (provider.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    
    res.status(200).json({ success: true, data: provider[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching provider', error });
  }
};

// Create new payment provider
export const createProvider = async (req: Request, res: Response) => {
  try {
    const {
      name,
      providerKey,
      description,
      logo,
      isActive,
      config,
      supportedCurrencies,
      supportedMethods
    } = req.body;

    const newProvider = await db
      .insert(paymentProviders)
      .values({
        name,
        providerKey,
        description,
        logo,
        isActive: isActive ?? true,
        config,
        supportedCurrencies,
        supportedMethods
      })
      .returning();

    res.status(201).json({ success: true, data: newProvider[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating provider', error });
  }
};

// Update payment provider
export const updateProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProvider = await db
      .update(paymentProviders)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(paymentProviders.id, id))
      .returning();

    if (updatedProvider.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    res.status(200).json({ success: true, data: updatedProvider[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating provider', error });
  }
};

// Toggle provider active status
export const toggleProviderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedProvider = await db
      .update(paymentProviders)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(paymentProviders.id, id))
      .returning();

    if (updatedProvider.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: `Provider ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedProvider[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling provider status', error });
  }
};

// Delete payment provider
export const deleteProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedProvider = await db
      .delete(paymentProviders)
      .where(eq(paymentProviders.id, id))
      .returning();

    if (deletedProvider.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    res.status(200).json({ success: true, message: 'Provider deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting provider', error });
  }
};