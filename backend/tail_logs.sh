#!/bin/bash

# Extracted from ARN: arn:aws:apprunner:eu-west-2:991176603801:service/docgen-api/dcdb02217c9a4bf788085e223141e0f7
SERVICE_NAME="docgen-api"
SERVICE_ID="dcdb02217c9a4bf788085e223141e0f7"
REGION="eu-west-2"

# App Runner application logs follow this pattern
LOG_GROUP="/aws/apprunner/${SERVICE_NAME}/${SERVICE_ID}/application"

echo "Tailing logs for App Runner service: $SERVICE_NAME ($SERVICE_ID)"
echo "Log Group: $LOG_GROUP"
echo "Region: $REGION"
echo "----------------------------------------"

# Requires AWS CLI v2
aws logs tail "$LOG_GROUP" --follow --region "$REGION" --format short
