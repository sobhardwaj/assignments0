# Subscription Billing Simulator

A comprehensive backend service for simulating recurring donations for nonprofit supporters with LLM-powered campaign tagging and summarization.

## Features

- ✅ RESTful API for subscription management
- ✅ Automatic recurring billing simulation
- ✅ LLM integration for campaign tagging and summarization
- ✅ PostgreSQL database with proper schema
- ✅ Request validation and error handling
- ✅ Docker containerization
- ✅ TypeScript for type safety
- ✅ Background job scheduling

## Features need to implements can be add more advance
- [] Caching
- [] register doner and validation of it.
- [] jwt token authurization for security
- [] notification after sucessful subscrtions or failure reason receipt for doner.
- [] LLM description response from real LLM api key.

## Quick Start

### Development (without Docker)

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Start PostgreSQL locally and create database

4. Run in development mode:

```bash
npm run dev
```

### Production (with Docker Compose)

```bash
npm run docker:compose
```

### Build Docker Image

```bash
npm run docker:build
```

## API Endpoints

### Create Subscription

```
POST /subscriptions
Content-Type: application/json

{
  "donorId": "abc123",
  "amount": 1500,
  "currency": "USD",
  "interval": "monthly",
  "campaignDescription": "Emergency food and clean water for earthquake victims in Nepal"
}
```

// response
{
"success": true,
"data": {
"id": "348f6658-cd24-43e1-9bdd-5eb40c72de8d",
"donorId": "abc123",
"amount": 1500,
"currency": "USD",
"interval": "monthly",
"campaignDescription": "Emergency food and clean water for earthquake victims in Nepal",
"tags": [
"disaster relief",
"food security",
"clean water",
"nepal"
],
"summary": "Emergency food and clean water for earthquake victims in Nepal",
"isActive": true,
"createdAt": "2025-09-15T05:53:20.625Z",
"updatedAt": "2025-09-15T05:53:20.625Z",
"nextBillingDate": "2025-10-15T05:53:21.141Z"
},
"message": "Subscription created successfully"
}

### Cancel Subscription

```
DELETE /subscriptions/:donorId
```

### Get All Subscriptions

```
GET /subscriptions
```

### Get Donor's Subscriptions

```
GET /subscriptions/:donorId
```

// response
{
"success": true,
"data": {
"donorId": "abc123",
"subscriptions": [
{
"id": "348f6658-cd24-43e1-9bdd-5eb40c72de8d",
"donorId": "abc123",
"amount": 1500,
"currency": "USD",
"interval": "monthly",
"campaignDescription": "Emergency food and clean water for earthquake victims in Nepal",
"tags": [
"disaster relief",
"food security",
"clean water",
"nepal"
],
"summary": "Emergency food and clean water for earthquake victims in Nepal",
"isActive": true,
"createdAt": "2025-09-15T05:53:20.625Z",
"updatedAt": "2025-09-15T05:53:20.625Z",
"nextBillingDate": "2025-10-15T05:53:21.141Z"
}
],
"count": 1
},
"message": "Donor subscriptions retrieved successfully"
}

### Get All Transactions

```
GET /transactions
```

### Get Donor's Transactions

```
GET /transactions/:donorId
```

### Health Check

```
GET /health
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `LLM_API_URL`: LLM service URL (mock for development)
- `LLM_API_KEY`: LLM service API key

## Architecture

- **Express.js**: Web framework
- **TypeScript**: Type safety
- **PostgreSQL**: Database
- **Joi**: Request validation
- **node-cron**: Background job scheduling
- **Docker**: Containerization

## Database Schema

### Subscriptions Table

- `id`: UUID primary key
- `donor_id`: Unique donor identifier
- `amount`: Amount in cents
- `currency`: Currency code (USD, EUR, etc.)
- `interval`: Billing interval (daily, weekly, monthly, yearly)
- `campaign_description`: Description of the campaign
- `tags`: Array of generated tags
- `summary`: LLM-generated summary
- `is_active`: Active status
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- `next_billing_date`: Next billing date

### Transactions Table

- `id`: UUID primary key
- `subscription_id`: Reference to subscription
- `donor_id`: Donor identifier
- `amount`: Transaction amount in cents
- `currency`: Currency code
- `status`: Transaction status
- `transaction_date`: Transaction timestamp
- `description`: Transaction description

## Background Jobs

The billing job runs every minute (configurable) to:

1. Find subscriptions due for billing
2. Process recurring payments
3. Create transaction records
4. Update next billing dates
5. Log results

## Error Handling

- Comprehensive error handling with proper HTTP status codes
- Custom error messages and validation
- Database constraint handling
- Graceful failure recovery

## Testing

```bash
npm test
```

## License

MIT
