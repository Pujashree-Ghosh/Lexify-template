const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

const awsS3AccessKey = process.env.REACT_APP_AWS_S3_ACCESS_KEY;
const awsS3SecretKey = process.env.REACT_APP_AWS_S3_SECRET_KEY;
const awsS3region = process.env.REACT_APP_AWS_S3_REGION;

const s3 = new AWS.S3({
  apiVersion: '2012-10-17',
  region: awsS3region,
  signatureVersion: 'v4',
  accessKeyId: awsS3AccessKey,
  secretAccessKey: awsS3SecretKey,
});

router.post('/getSignUrl', async (req, res) => {
  try {
    const fileName = req.body.fileName;
    const myBucket = 'lexify';
    const signedUrlExpireSeconds = 60 * 5;
    const url = await s3.getSignedUrlPromise('putObject', {
      Bucket: myBucket,
      Key: fileName,
      Expires: signedUrlExpireSeconds,
      ACL: 'public-read',
    });
    res.send(url);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
