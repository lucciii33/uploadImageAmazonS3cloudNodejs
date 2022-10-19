const uuid = require("uuid").v4
const {S3Client, PutObjectCommand}= require("@aws-sdk/client-s3")


exports.s3Uploadv3 = async (files) => {
    const s3client = new S3Client();
  
    const params = files.map((file) => {
      return {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${uuid()}-${file.originalname}`,
        Body: file.buffer,
      };
    });
  
    return await Promise.all(
      params.map((param) => s3client.send(new PutObjectCommand(param)))
    );
  };