#!/bin/bash

echo "=== Création des buckets S3 ==="

awslocal s3 mb s3://timemanager-uploads
awslocal s3 mb s3://timemanager-backups
awslocal s3 mb s3://timemanager-exports

echo "✓ Buckets S3 créés avec succès"
awslocal s3 ls
