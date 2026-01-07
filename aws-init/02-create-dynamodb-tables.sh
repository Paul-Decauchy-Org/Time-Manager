#!/bin/bash

echo "=== Création des tables DynamoDB ==="

# Table Sessions
awslocal dynamodb create-table \
    --table-name TimeManagerSessions \
    --attribute-definitions \
        AttributeName=SessionId,AttributeType=S \
        AttributeName=UserId,AttributeType=S \
    --key-schema \
        AttributeName=SessionId,KeyType=HASH \
    --global-secondary-indexes \
        "[{
            \"IndexName\": \"UserIdIndex\",
            \"KeySchema\": [{\"AttributeName\":\"UserId\",\"KeyType\":\"HASH\"}],
            \"Projection\":{\"ProjectionType\":\"ALL\"},
            \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}
        }]" \
    --billing-mode PAY_PER_REQUEST

echo "✓ Tables DynamoDB créées avec succès"
awslocal dynamodb list-tables
