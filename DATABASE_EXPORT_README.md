# WhatsWay Database Export

## Export Information
- **Export Date**: January 6, 2025
- **Database Type**: PostgreSQL (Neon Database)
- **Export Files**:
  - `complete_database_export.sql` - Full database export with schema and data
  - `database_schema.sql` - Schema only (table structures, indexes, constraints)
  - `database_export.sql` - Data only (INSERT statements)

## How to Import

### Option 1: Import Complete Database
```bash
# For a new database
psql -U username -d database_name < complete_database_export.sql

# Or using connection string
psql "postgresql://username:password@host:port/database" < complete_database_export.sql
```

### Option 2: Import Schema First, Then Data
```bash
# Import schema
psql -U username -d database_name < database_schema.sql

# Import data
psql -U username -d database_name < database_export.sql
```

## Database Tables

The export includes the following tables:
1. **users** - System users and authentication
2. **contacts** - WhatsApp contacts
3. **contact_groups** - Contact grouping
4. **campaigns** - Campaign management
5. **campaign_messages** - Campaign message tracking
6. **whatsapp_channels** - WhatsApp Business channels
7. **templates** - Message templates
8. **template_categories** - Template categories
9. **conversations** - Chat conversations
10. **messages** - Individual messages
11. **message_queue** - Message queue for sending
12. **webhook_configs** - Webhook configurations
13. **api_logs** - API call logging
14. **sessions** - User sessions

## Default Admin Credentials
- **Username**: whatsway
- **Password**: Admin@123

## Notes
- The export preserves all relationships and constraints
- Passwords are hashed using scrypt algorithm
- All timestamps are in UTC
- The export is compatible with PostgreSQL 12+

## Restoration Tips
1. Create a new database before importing
2. Ensure the database user has sufficient privileges
3. Check for any existing data conflicts before importing
4. The export includes INSERT statements with explicit values
5. No ownership or ACL information is included for portability