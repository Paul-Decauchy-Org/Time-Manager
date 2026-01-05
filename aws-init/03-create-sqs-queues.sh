#!/bin/bash

echo "=== Création des queues SQS ==="

# Queue pour les jobs
awslocal sqs create-queue --queue-name timemanager-jobs

# Queue pour les notifications
awslocal sqs create-queue --queue-name timemanager-notifications

echo "✓ Queues SQS créées avec succès"
awslocal sqs list-queues
