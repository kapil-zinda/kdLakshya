'use server';

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { log } from "console";

export async function onFilesUpload(formData: FormData): Promise<string | null> {
    try {
        // Ensure the AWS region and bucket name are set in the environment
        const region = process.env.AWS_REGION;
        const bucketName = process.env.AWS_BUCKET_NAME;

        if (!region || !bucketName) {
            throw new Error("AWS region or bucket name is not set in the environment variables.");
        }

        log("AWS Region:", region);
        log("AWS Bucket Name:", bucketName);

        const client = new S3Client({ region });

        // Get the file from the formData
        const file = formData.get('file') as File;
        const s3key = formData.get('s3key') as string;  // Expecting s3key to be passed

        if (!file) {
            throw new Error("File is required");
        }

        if (!s3key) {
            throw new Error("S3 key (file path) is required");
        }

        log("File received:", file.name);
        log("S3 Key:", s3key);

        // Convert the file to a Buffer (S3 expects file data in a specific format)
        const fileArrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(fileArrayBuffer);

        log("File size (bytes):", fileBuffer.byteLength);

        // Prepare the parameters for the S3 PutObject command
        const params = {
            Bucket: bucketName,
            Key: s3key,
            Body: fileBuffer,
            ContentType: file.type,  // Set content type based on the uploaded file
        };

        // Upload the file directly to S3
        log("Sending file to S3...");
        const command = new PutObjectCommand(params);
        const response = await client.send(command);

        log("S3 upload response:", response);

        if (response.$metadata.httpStatusCode === 200) {
            log("File uploaded successfully to S3.");
            return `File uploaded to S3 at ${s3key}`;
        } else {
            log("Failed to upload file to S3.");
            return null;
        }
    } catch (err) {
        console.error('Error uploading file to S3:', err);
        return null;
    }
}
