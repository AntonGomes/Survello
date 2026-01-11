#!/bin/bash

# Configuration
REGION="eu-west-2"
ACCOUNT_ID="991176603801"
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/service-role/DocgenECRAccessRole"
INSTANCE_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/AppRunner-S3-Access-Role"
VPC_CONNECTOR_ARN="arn:aws:apprunner:eu-west-2:${ACCOUNT_ID}:vpcconnector/docgen-connector/1/21fb1a6d22c243bbb17dae32e8e60cf9"
IMAGE_REPO="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/survello-backend"

# ---------------------------------------------------------
# STAGING
# ---------------------------------------------------------
STAGING_DB_HOST="survello-db-staging.crowwu20ehg9.eu-west-2.rds.amazonaws.com"
STAGING_DB_PASS="h7NTeWjjWZ8QZ4G"
STAGING_S3="survello-assets-staging"

cat > service_staging.json <<EOF
{
    "ServiceName": "survello-api-staging",
    "SourceConfiguration": {
        "AuthenticationConfiguration": { "AccessRoleArn": "$ROLE_ARN" },
        "AutoDeploymentsEnabled": true,
        "ImageRepository": {
            "ImageIdentifier": "$IMAGE_REPO:staging",
            "ImageRepositoryType": "ECR",
            "ImageConfiguration": {
                "RuntimeEnvironmentVariables": {
                    "AWS_DEFAULT_REGION": "$REGION",
                    "DB_HOST": "$STAGING_DB_HOST",
                    "DB_PASSWORD": "$STAGING_DB_PASS",
                    "DB_PORT": "5432",
                    "DB_USER": "survello_admin",
                    "OPENAI_API_KEY": "REPLACE_ME",
                    "S3_BUCKET_NAME": "$STAGING_S3",
                    "API_V1_STR": "/api/v1",
                    "PROJECT_NAME": "Survello Staging"
                },
                "Port": "8080"
            }
        }
    },
    "InstanceConfiguration": {
        "Cpu": "1024",
        "Memory": "2048",
        "InstanceRoleArn": "$INSTANCE_ROLE_ARN"
    },
    "NetworkConfiguration": {
        "EgressConfiguration": {
            "EgressType": "VPC",
            "VpcConnectorArn": "$VPC_CONNECTOR_ARN"
        }
    }
}
EOF

echo "Creating Staging Service..."
aws apprunner create-service --cli-input-json file://service_staging.json --region $REGION

# ---------------------------------------------------------
# PROD
# ---------------------------------------------------------
PROD_DB_HOST="survello-db-prod.crowwu20ehg9.eu-west-2.rds.amazonaws.com" # UPDATE THIS
PROD_DB_PASS="h7NTeWjjWZ8QZ4G"
PROD_S3="survello-assets-prod"

cat > service_prod.json <<EOF
{
    "ServiceName": "survello-api-prod",
    "SourceConfiguration": {
        "AuthenticationConfiguration": { "AccessRoleArn": "$ROLE_ARN" },
        "AutoDeploymentsEnabled": true,
        "ImageRepository": {
            "ImageIdentifier": "$IMAGE_REPO:prod",
            "ImageRepositoryType": "ECR",
            "ImageConfiguration": {
                "RuntimeEnvironmentVariables": {
                    "AWS_DEFAULT_REGION": "$REGION",
                    "DB_HOST": "$PROD_DB_HOST",
                    "DB_PASSWORD": "$PROD_DB_PASS",
                    "DB_PORT": "5432",
                    "DB_USER": "survello_admin",
                    "OPENAI_API_KEY": "REPLACE_ME",
                    "S3_BUCKET_NAME": "$PROD_S3",
                    "API_V1_STR": "/api/v1",
                    "PROJECT_NAME": "Survello Prod"
                },
                "Port": "8080"
            }
        }
    },
    "InstanceConfiguration": {
        "Cpu": "1024",
        "Memory": "2048",
        "InstanceRoleArn": "$INSTANCE_ROLE_ARN"
    },
    "NetworkConfiguration": {
        "EgressConfiguration": {
            "EgressType": "VPC",
            "VpcConnectorArn": "$VPC_CONNECTOR_ARN"
        }
    }
}
EOF

echo "Creating Prod Service..."
aws apprunner create-service --cli-input-json file://service_prod.json --region $REGION

rm service_staging.json service_prod.json
