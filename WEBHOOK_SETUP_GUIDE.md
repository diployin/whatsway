# WhatsApp Webhook Setup Guide

## What are Webhooks?

Webhooks are automated messages sent from WhatsApp to your application when events happen. Think of them as instant notifications that tell your app when:
- A message is sent
- A message is delivered
- A message is read
- Someone replies to your message

## How Webhooks Work in WhatsWay

1. **WhatsApp sends events** → Your webhook endpoint receives them → Your app updates in real-time

2. **Each channel has its own webhook URL**:
   - Format: `https://your-domain.com/webhook/[channel-id]`
   - Example: `https://your-app.replit.app/webhook/d420e261-9c12-4cee-9d65-253c8f7b9876`

## Step-by-Step Setup Instructions

### Step 1: Get Your Webhook URL

1. Go to **Settings** page in WhatsWay
2. Click on the **Webhooks** tab
3. Find your channel in the list
4. Click **Copy URL** button to copy your webhook endpoint

### Step 2: Configure in WhatsApp Business Platform

1. Log in to [Facebook Business Manager](https://business.facebook.com)
2. Go to your WhatsApp Business App
3. Navigate to **Configuration** → **Webhooks**
4. Click **Edit** next to Callback URL
5. Enter your webhook URL from Step 1
6. Enter a **Verify Token** (any secure string like `my-secure-verify-token-123`)
7. Subscribe to these webhook fields:
   - `messages` - For incoming messages
   - `message_status` - For delivery/read receipts
   - `message_template_status_update` - For template approvals

### Step 3: Configure Webhook in WhatsWay

1. Back in WhatsWay Settings → Webhooks
2. Click **Configure Webhook**
3. Enter the same **Verify Token** you used in WhatsApp
4. Save the configuration

### Step 4: Test Your Webhook

1. Send a test message from WhatsApp
2. Check the **Inbox** page in WhatsWay
3. You should see the message appear in real-time

## What Happens Behind the Scenes

When someone sends a WhatsApp message:

1. **WhatsApp receives the message**
2. **WhatsApp sends a webhook notification** to your URL
3. **WhatsWay processes the webhook**:
   - Verifies the signature for security
   - Creates/updates the conversation
   - Stores the message
   - Updates unread count
4. **Your Inbox updates automatically**

## Troubleshooting

### Webhook Not Working?

1. **Check the URL**: Make sure you copied the complete webhook URL including the channel ID
2. **Verify Token**: Ensure the verify token matches in both WhatsApp and WhatsWay
3. **HTTPS Required**: Webhooks only work with HTTPS URLs (Replit provides this automatically)
4. **Check Logs**: Look for webhook events in your browser console

### Common Issues

- **"Webhook URL not verified"**: The verify token doesn't match
- **Messages not appearing**: Check if webhook fields are subscribed in WhatsApp
- **Delayed messages**: This might be a WhatsApp server issue, usually resolves itself

## Security Features

WhatsWay implements several security measures:
- **Signature Verification**: Every webhook is verified using WhatsApp's signature
- **Channel-specific URLs**: Each channel has its own unique webhook endpoint
- **HTTPS Only**: All webhook traffic is encrypted

## Next Steps

After setting up webhooks, you can:
- Receive messages in real-time
- Track message delivery status
- Build automations based on incoming messages
- Set up auto-replies and chatbots

Need more help? The webhook system is already built into WhatsWay - you just need to configure it with your WhatsApp Business account!