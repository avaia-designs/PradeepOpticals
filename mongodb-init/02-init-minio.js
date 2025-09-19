// MinIO initialization script
// This script sets up the ecommerce-uploads bucket with public read access

const { Client } = require('minio');

const minioClient = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin123'
});

const bucketName = 'ecommerce-uploads';

// Bucket policy for public read access
const publicReadPolicy = {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": [`arn:aws:s3:::${bucketName}/*`]
    }
  ]
};

async function initializeMinIO() {
  try {
    console.log('Initializing MinIO...');
    
    // Check if bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName);
    
    if (!bucketExists) {
      // Create bucket
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket '${bucketName}' created successfully`);
    } else {
      console.log(`Bucket '${bucketName}' already exists`);
    }
    
    // Set bucket policy for public read access
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(publicReadPolicy));
    console.log(`Public read policy set for bucket '${bucketName}'`);
    
    console.log('MinIO initialization completed successfully');
    
  } catch (error) {
    console.error('Error initializing MinIO:', error);
    process.exit(1);
  }
}

// Run initialization
initializeMinIO();
