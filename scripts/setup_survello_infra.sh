#!/bin/bash
set -e

# Configuration
REGION="eu-west-2"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
VPC_ID="vpc-0f4fa845ceeb5390e" # Your existing VPC
SUBNET_IDS="subnet-0d84426ba6d6116ba,subnet-093e7f40703d737ec,subnet-099b1e705efa527fc" # Your existing subnets
SECURITY_GROUP="sg-094887054bc921cbf" # Your existing SG
VPC_CONNECTOR="arn:aws:apprunner:eu-west-2:${ACCOUNT_ID}:vpcconnector/docgen-connector/1/21fb1a6d22c243bbb17dae32e8e60cf9"
EXECUTION_ROLE="arn:aws:iam::${ACCOUNT_ID}:role/service-role/DocgenECRAccessRole"
INSTANCE_ROLE="arn:aws:iam::${ACCOUNT_ID}:role/AppRunner-S3-Access-Role"

echo "🚀 Starting Survello Infrastructure Setup..."
echo "Account ID: $ACCOUNT_ID"

# 1. ECR
echo "📦 Creating ECR Repository: survello-backend..."
aws ecr create-repository --repository-name survello-backend --region $REGION || echo "Repo exists"

# 2. S3 Buckets
echo "🪣 Creating S3 Buckets..."
aws s3 mb s3://survello-assets-staging --region $REGION || echo "Staging bucket exists"
aws s3 mb s3://survello-assets-prod --region $REGION || echo "Prod bucket exists"

# 3. Databases (RDS)
echo "Enter password for DBs (hidden):"
read -s DB_PASSWORD

echo "🐘 Creating Staging DB (survello-db-staging)..."
aws rds create-db-instance \
    --db-instance-identifier survello-db-staging \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username survello_admin \
    --master-user-password "$DB_PASSWORD" \
    --allocated-storage 20 \
    --vpc-security-group-ids $SECURITY_GROUP \
    --availability-zone eu-west-2b \
    --publicly-accessible \
    --region $REGION \
    --no-cli-pager || echo "DB creation command failed (or DB exists)"

echo "🐘 Creating Prod DB (survello-db-prod)..."
aws rds create-db-instance \
    --db-instance-identifier survello-db-prod \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username survello_admin \
    --master-user-password "$DB_PASSWORD" \
    --allocated-storage 20 \
    --vpc-security-group-ids $SECURITY_GROUP \
    --availability-zone eu-west-2b \
    --publicly-accessible \
    --region $REGION \
    --no-cli-pager || echo "DB creation command failed (or DB exists)"

echo "⏳ Waiting for DBs to be available (this may take 5-10 mins)..."
# In a real script we would loop check, but for now we just warn.

echo "✅ Infrastructure setup commands sent."
echo "NEXT STEPS:"
echo "1. Wait for DBs to be 'available' in AWS Console."
echo "2. Copy their Endpoints."
echo "3. Run 'scripts/deploy_services.sh' (You need to create this) to launch App Runner."
