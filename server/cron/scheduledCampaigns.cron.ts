import cron from "node-cron";
import { storage } from "../storage";
import {startCampaignExecution} from "../controllers/campaigns.controller";

// ⏰ Runs every minute
export function startScheduledCampaignCron() {
  cron.schedule("* * * * *", async () => {
    try {
      console.log("⏳ Cron: checking scheduled campaigns");

      const now = new Date();

      // 🟡 Sirf scheduled campaigns jinka time aa chuka hai
      const campaigns = await storage.getScheduledCampaigns(now);

      for (const campaign of campaigns) {
        console.log("🚀 Starting scheduled campaign:", campaign.id);

        // 1️⃣ Mark active
        await storage.updateCampaign(campaign.id, {
          status: "active",
        });

        // 2️⃣ Start execution
        await startCampaignExecution(campaign.id);
      }
    } catch (error) {
      console.error("❌ Cron error (scheduled campaigns):", error);
    }
  });
}
