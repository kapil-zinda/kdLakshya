'use server';

import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

export async function onFilesUpload(formData: FormData): Promise<string | null> {
    try {
        // Ensure the AWS region and bucket name are set in the environment
        const region = process.env.AWS_REGION;
        const bucketName = process.env.AWS_BUCKET_NAME;

        if (!region || !bucketName) {
            throw new Error("AWS region or bucket name is not set in the environment variables.");
        }

        const client = new S3Client({
            region: region,
        });

        // Get the file from the formData
        const file = formData.get('file') as File;
        const s3key = formData.get('s3key') as String;

        if (!file) {
            throw new Error("File is required");
        }

        // Create a presigned post for S3
        const { url, fields } = await createPresignedPost(client, {
            Bucket: bucketName,
            Key: s3key,  // Use the actual file name as S3 key
        });

        const formDataS3 = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
            formDataS3.append(key, value);
        });

        // Append the file to the FormData to be sent to S3
        formDataS3.append('file', file);

        // Perform the file upload
        const uploadResponse = await fetch(url, {
            method: 'POST',
            body: formDataS3,
        });

        // Parse response
        const responseText = await uploadResponse.text();

        if (uploadResponse.ok) {
            console.log('File uploaded successfully:', responseText);
            return responseText;  // Return success response
        } else {
            console.error('Failed to upload file:', responseText);
            return null;  // Indicate failure
        }
    } catch (err) {
        console.error('Error uploading file:', err);
        return null;  // Return null on failure
    }
}