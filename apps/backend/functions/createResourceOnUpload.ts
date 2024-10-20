import * as S3 from "@aws-sdk/client-s3"
import db from "@db/db";
import { resource } from "@db/schema";
import { createResourceOnUploadHandlerType } from "@type/functions/miscellaneous";
import createPreviewOnUpload from "./utils/createPreviewOnUpload";

const createResourceOnUploadHandler = async (evt: any) => {
  // const uploaderIP = evt.Records[0].requestParameters.sourceIPAddress
  const bucketName = evt.Records[0].s3.bucket.name;
  const objectKey = evt.Records[0].s3.object.key;

  if(objectKey.endsWith("preview.png")) return;

  const client = new S3.S3Client({});

  const getObjectCommand = new S3.GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey
  })

  try {
    const object = (await client.send(getObjectCommand));
    
    const createResourceOnUploadHandlerTypeAnswer = createResourceOnUploadHandlerType.safeParse(object.Metadata);
    
    if (!createResourceOnUploadHandlerTypeAnswer.success) {
      console.error("Invalid metadata: ", createResourceOnUploadHandlerTypeAnswer.error.flatten());
      deleteObject(objectKey, bucketName, client);
      return;
    }

    const fileExtension = getFileExtension(createResourceOnUploadHandlerTypeAnswer.data.key);

    if (!fileExtension) {
      console.error("Invalid / No file extension");
      deleteObject(objectKey, bucketName, client);
      return;
    }

    await db.insert(resource).values({
      extension: fileExtension,
      key: createResourceOnUploadHandlerTypeAnswer.data.key,
      name: createResourceOnUploadHandlerTypeAnswer.data.name,
      description: createResourceOnUploadHandlerTypeAnswer.data.description,
    })

    try {
      if(fileExtension === "pdf" || fileExtension === "png" || fileExtension === "jpg" || fileExtension === "jpeg") {
        await createPreviewOnUpload(createResourceOnUploadHandlerTypeAnswer.data.key, fileExtension, bucketName, client, await object.Body?.transformToByteArray());    
      }
    } catch (error) {
      return; // do nothing if not able to create preview
    }

  } catch (error) {
    deleteObject(objectKey, bucketName, client);
  }
  return;
};

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex !== -1 ? fileName.slice(lastDotIndex + 1) : null;
}

async function deleteObject(key: string, bucket: string, client: S3.S3Client) {
  const deleteObjectCommand = new S3.DeleteObjectCommand({
    Bucket: bucket,
    Key: key
  });

  try {
    await client.send(deleteObjectCommand);
  } catch (error: any) {
    console.error(error.message);
  }
    
}

export default createResourceOnUploadHandler;