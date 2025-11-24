import { Request, Response } from 'express';
import { db } from '../db';
import { smtpConfig } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const upsertSMTPConfig = async (req: Request, res: Response) => {
  try {
    const {
      host,
      port,
      secure,
      user,
      password,
      fromName,
      fromEmail,
      logo,
    } = req.body;

    // Check if a config already exists
    const existingConfig = await db.select().from(smtpConfig).limit(1);

    let result;
    if (existingConfig.length > 0) {
      // Update existing
      result = await db
        .update(smtpConfig)
        .set({
          host,
          port,
          secure,
          user,
          password,
          fromName,
          fromEmail,
          logo,
          updatedAt: new Date(),
        })
        .where(eq(smtpConfig.id, existingConfig[0].id))
        .returning();
    } else {
      // Insert new
      result = await db
        .insert(smtpConfig)
        .values({
          host,
          port,
          secure,
          user,
          password,
          fromName,
          fromEmail,
          logo,
        })
        .returning();
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('SMTP upsert error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to save SMTP config', error });
  }
};

// GET SMTP configuration
export const getSMTPConfigHandler = async (req: Request, res: Response) => {
  try {
    // Assuming there's only one SMTP config row
    const config = await db.select().from(smtpConfig).limit(1);

    if (!config || config.length === 0) {
      return res.status(404).json({
        success: false,
        message: "SMTP configuration not found",
      });
    }

    res.status(200).json({
      success: true,
      data: config[0],
    });
  } catch (error) {
    console.error("SMTP fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch SMTP configuration",
      error,
    });
  }
};


export const getSMTPConfig = async () => {
  const configs = await db.select().from(smtpConfig).limit(1);
 if (!configs || configs.length === 0) {
  console.warn('⚠️ No SMTP configuration found');
  return null;
}
return configs[0];
};
