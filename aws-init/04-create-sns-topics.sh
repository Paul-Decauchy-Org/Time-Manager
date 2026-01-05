#!/bin/bash

echo "=== Création des topics SNS ==="

# Topic pour les alertes
awslocal sns create-topic --name timemanager-alerts

echo "✓ Topics SNS créés avec succès"
awslocal sns list-topics
