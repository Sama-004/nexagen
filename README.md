# Project Setup Guide

## Installation Steps

### 1. Clone the Repository

```bash
git clone github.com/sama-004/nexagen
cd nexagen
```

### 2. Backend Setup

#### Install Dependencies

```bash
pnpm install
```

#### Configure Environment

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit the `.env` file and fill in your specific configuration details

#### Database Migration

```bash
npx drizzle-kit push
```

#### Start the Server

```bash
pnpm run dev
```

### 3. Frontend Setup

#### Navigate to Client Directory

```bash
cd client/
```

#### Install Client Dependencies

```bash
pnpm install
```

#### Start the Client

```bash
pnpm run dev
```

## Troubleshooting

- Ensure all environment variables are correctly set in the `.env` file
