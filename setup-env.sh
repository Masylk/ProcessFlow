#!/bin/bash

echo "🚀 ProcessFlow Docker Environment Setup"
echo "======================================"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file already exists"
else
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://postgres:password@db:5432/processflow
DIRECT_URL=postgresql://postgres:password@db:5432/processflow

# Supabase Configuration (REQUIRED - Replace with your actual values)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
NEXT_PUBLIC_SUPABASE_STORAGE_PATH=/storage/v1/object/public

# Stripe Configuration (Optional for development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_MONTHLY_PRICE_ID=price_your_monthly_price_id
NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_ANNUAL_PRICE_ID=price_your_annual_price_id

# Email Configuration (Optional for development)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Social Links
NEXT_PUBLIC_PRODUCTHUNT_URL=https://www.producthunt.com
NEXT_PUBLIC_LINKEDIN_URL=https://www.linkedin.com/company/processflow1/
NEXT_PUBLIC_X_URL=https://x.com

# Email Senders
EMAIL_SENDER_CONTACT=contact@process-flow.io
EMAIL_SENDER_JEAN=jean@process-flow.io
EMAIL_SENDER_NOREPLY=noreply@notifications.process-flow.io

# Sentry (Optional)
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=pf-5j
SENTRY_PROJECT=processflow
EOF
    echo "✅ .env file created"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Edit the .env file with your actual Supabase credentials"
echo "2. Run: docker-compose -f docker-compose.dev.yml up --build"
echo "3. Run database migrations: docker-compose -f docker-compose.dev.yml exec app npx prisma migrate deploy"
echo ""
echo "🔗 Get your Supabase credentials from: https://supabase.com/dashboard"
echo "   - Go to your project settings"
echo "   - Copy the URL and anon key"
echo ""
echo "⚠️  IMPORTANT: Replace the placeholder values in .env with your actual credentials!"
