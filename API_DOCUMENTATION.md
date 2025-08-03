# WhatsWay API Documentation

## Base URL
```
https://your-domain.com/api
```

## Authentication
All API endpoints require authentication using session cookies. Login first to obtain a session.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "whatsway",
  "password": "Admin@123"
}
```

Response:
```json
{
  "id": "user-id",
  "username": "whatsway",
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@whatsway.com",
  "role": "admin"
}
```

### Logout
```http
POST /api/auth/logout
```

### Get Current User
```http
GET /api/auth/me
```

## Contacts API

### List Contacts
```http
GET /api/contacts?page=1&limit=10&search=john&groupId=group-id
```

Query Parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search query
- `groupId` (string): Filter by group
- `tags` (string): Comma-separated tags

Response:
```json
{
  "contacts": [
    {
      "id": "contact-id",
      "phoneNumber": "+1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "tags": ["customer", "vip"],
      "groups": ["sales"],
      "createdAt": "2025-01-03T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

### Create Contact
```http
POST /api/contacts
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "tags": ["customer"],
  "groups": ["sales"]
}
```

### Import Contacts (CSV)
```http
POST /api/contacts/import
Content-Type: multipart/form-data

file: contacts.csv
groupId: group-id (optional)
tags: tag1,tag2 (optional)
```

CSV Format:
```csv
phoneNumber,name,email
+1234567890,John Doe,john@example.com
+0987654321,Jane Smith,jane@example.com
```

Response:
```json
{
  "success": true,
  "imported": 90,
  "duplicates": 10,
  "errors": 0,
  "message": "Successfully imported 90 contacts, 10 duplicates skipped"
}
```

## Campaigns API

### List Campaigns
```http
GET /api/campaigns?status=active&type=contact
```

Query Parameters:
- `status` (string): active, completed, scheduled, failed
- `type` (string): contact, csv, api

### Create Campaign
```http
POST /api/campaigns
Content-Type: application/json

{
  "name": "Holiday Sale",
  "type": "contact",
  "templateId": "template-id",
  "contactIds": ["contact1", "contact2"],
  "scheduledAt": "2025-01-10T10:00:00Z",
  "variables": {
    "1": "John",
    "2": "20% OFF"
  }
}
```

### Execute Campaign
```http
POST /api/campaigns/:id/execute
```

### Campaign Statistics
```http
GET /api/campaigns/:id/stats
```

Response:
```json
{
  "total": 1000,
  "sent": 950,
  "delivered": 920,
  "read": 450,
  "failed": 50,
  "pending": 0
}
```

## Templates API

### List Templates
```http
GET /api/templates?status=approved&category=marketing
```

Query Parameters:
- `status` (string): approved, pending, rejected
- `category` (string): marketing, utility, authentication

### Create Template
```http
POST /api/templates
Content-Type: application/json

{
  "name": "holiday_sale_2025",
  "category": "marketing",
  "language": "en",
  "header": {
    "type": "text",
    "text": "Holiday Sale!"
  },
  "body": {
    "text": "Hi {{1}}, enjoy {{2}} discount on all items!"
  },
  "footer": {
    "text": "Valid until Dec 31"
  },
  "buttons": [
    {
      "type": "url",
      "text": "Shop Now",
      "url": "https://example.com"
    }
  ]
}
```

### Sync Templates
```http
POST /api/templates/sync
```

Syncs templates from WhatsApp Business API.

## Messages API

### Send Message
```http
POST /api/messages/send
Content-Type: application/json

{
  "to": "+1234567890",
  "templateId": "template-id",
  "variables": {
    "1": "John",
    "2": "20% OFF"
  }
}
```

### Get Conversations
```http
GET /api/conversations?status=open&assignedTo=user-id
```

Query Parameters:
- `status` (string): open, closed
- `assignedTo` (string): User ID
- `search` (string): Search in messages

### Get Messages
```http
GET /api/conversations/:id/messages?page=1&limit=50
```

### Reply to Conversation
```http
POST /api/conversations/:id/reply
Content-Type: application/json

{
  "message": "Thank you for your message!",
  "type": "text"
}
```

## Automations API

### List Automations
```http
GET /api/automations
```

### Create Automation
```http
POST /api/automations
Content-Type: application/json

{
  "name": "Welcome Flow",
  "trigger": "message_received",
  "triggerConfig": {
    "keyword": "start"
  },
  "nodes": [
    {
      "id": "node1",
      "type": "send_template",
      "config": {
        "templateId": "welcome_template"
      }
    },
    {
      "id": "node2",
      "type": "wait",
      "config": {
        "duration": 3600
      }
    }
  ]
}
```

### Toggle Automation
```http
POST /api/automations/:id/toggle
```

## Webhook API

### WhatsApp Webhook
```http
POST /api/webhook
```

This endpoint receives WhatsApp events. Configure in Meta dashboard.

### Webhook Verification
```http
GET /api/webhook?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=challenge
```

## Analytics API

### Dashboard Statistics
```http
GET /api/dashboard/stats
```

Response:
```json
{
  "totalContacts": 5000,
  "totalCampaigns": 50,
  "totalMessagesSent": 100000,
  "totalConversations": 2000,
  "messageStats": {
    "sent": 100000,
    "delivered": 95000,
    "read": 60000,
    "failed": 5000
  },
  "campaignStats": {
    "active": 5,
    "completed": 40,
    "scheduled": 5
  }
}
```

### Message Analytics
```http
GET /api/analytics?startDate=2025-01-01&endDate=2025-01-31
```

## Error Responses

All errors follow this format:
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited to:
- 100 requests per minute for read operations
- 20 requests per minute for write operations
- 5 requests per minute for bulk operations

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704300000
```

## Pagination

List endpoints support pagination:
```
?page=1&limit=10
```

Response includes:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "totalPages": 10,
  "hasNext": true,
  "hasPrev": false
}
```

## Webhooks

Configure webhooks for real-time updates:

### Message Status
```json
{
  "event": "message.status",
  "data": {
    "messageId": "msg-id",
    "status": "delivered",
    "timestamp": "2025-01-03T10:00:00Z"
  }
}
```

### New Message
```json
{
  "event": "message.received",
  "data": {
    "from": "+1234567890",
    "message": "Hello!",
    "timestamp": "2025-01-03T10:00:00Z"
  }
}
```

## SDK Examples

### JavaScript/Node.js
```javascript
const WhatsWayAPI = require('whatsway-sdk');

const client = new WhatsWayAPI({
  baseURL: 'https://your-domain.com/api',
  username: 'your-username',
  password: 'your-password'
});

// Send a message
const result = await client.messages.send({
  to: '+1234567890',
  templateId: 'welcome_template',
  variables: { '1': 'John' }
});
```

### Python
```python
from whatsway import WhatsWayClient

client = WhatsWayClient(
    base_url='https://your-domain.com/api',
    username='your-username',
    password='your-password'
)

# List contacts
contacts = client.contacts.list(page=1, limit=10)

# Send campaign
campaign = client.campaigns.create(
    name='Holiday Sale',
    template_id='template-id',
    contact_ids=['contact1', 'contact2']
)
```

### cURL
```bash
# Login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"whatsway","password":"Admin@123"}' \
  -c cookies.txt

# Get contacts
curl -X GET https://your-domain.com/api/contacts \
  -b cookies.txt

# Send message
curl -X POST https://your-domain.com/api/messages/send \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "to": "+1234567890",
    "templateId": "template-id",
    "variables": {"1": "John"}
  }'
```

## Best Practices

1. **Authentication**: Always use HTTPS in production
2. **Error Handling**: Implement retry logic for failed requests
3. **Rate Limiting**: Respect rate limits to avoid being blocked
4. **Webhooks**: Use webhooks for real-time updates instead of polling
5. **Bulk Operations**: Use bulk endpoints for better performance
6. **Pagination**: Always paginate large result sets
7. **Caching**: Cache frequently accessed data
8. **Monitoring**: Monitor API usage and errors

---

For more information or support, contact support@whatsway.com