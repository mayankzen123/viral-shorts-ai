#!/usr/bin/env node

import { 
  getOrCreateBucket, 
  deploySite, 
  getAwsRegion,
  ensureFunction 
} from '@remotion/lambda';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🚀 Setting up Remotion Lambda for cloud video rendering');

// Get AWS region from args or use default
const region = process.argv[2] || 'us-east-1';
console.log(`Using AWS region: ${region}`);

const setup = async () => {
  try {
    // Step 1: Create or get an S3 bucket for Remotion Lambda
    console.log('Creating or validating S3 bucket...');
    const { bucketName } = await getOrCreateBucket({
      region,
    });
    console.log(`✅ Using S3 bucket: ${bucketName}`);

    // Step 2: Deploy remotion compositions to S3
    console.log('Deploying Remotion compositions to S3...');
    const { serveUrl } = await deploySite({
      entryPoint: path.join(rootDir, 'src', 'remotion', 'bundle.tsx'),
      bucketName,
      region,
    });
    console.log(`✅ Remotion site deployed to: ${serveUrl}`);

    // Step 3: Ensure the Lambda function is set up
    console.log('Setting up Lambda function...');
    const functionName = `remotion-renderer-${bucketName}`;
    await ensureFunction({
      region,
      functionName,
    });
    console.log(`✅ Lambda function "${functionName}" is ready`);

    // Save config to file for reference
    const config = {
      region,
      bucketName,
      functionName,
      serveUrl,
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(rootDir, 'remotion-lambda-config.json'),
      JSON.stringify(config, null, 2)
    );

    console.log('\n🎉 Remotion Lambda setup complete!');
    console.log('Configuration saved to remotion-lambda-config.json');
    console.log('\nTo use in your API:');
    console.log('1. The download button should now work automatically');
    console.log('2. Values from remotion-lambda-config.json are being used:');
    console.log(`   - region: '${region}'`);
    console.log(`   - functionName: '${functionName}'`);
    console.log(`   - serveUrl: '${serveUrl}'`);

  } catch (error) {
    console.error('❌ Error setting up Remotion Lambda:', error);
    process.exit(1);
  }
};

// Check AWS credentials before proceeding
const awsRegion = await getAwsRegion();
if (!awsRegion) {
  console.error('\n❌ AWS credentials not found or not configured correctly.');
  console.error('Please set up your AWS credentials:');
  console.error('1. Install AWS CLI: https://aws.amazon.com/cli/');
  console.error('2. Run: aws configure');
  console.error('3. Enter your AWS Access Key ID and Secret Access Key when prompted');
  console.error('4. Run this script again');
  process.exit(1);
}

setup(); 