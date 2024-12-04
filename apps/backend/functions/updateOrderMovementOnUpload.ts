import * as S3 from "@aws-sdk/client-s3"
import db from "@db/db";
import { order_movement } from "@db/schema";
import { updateOrderMovementOnUploadType } from "@type/functions/order";
import { eq } from "drizzle-orm";

const updateOrderMovementOnUploadHandler = async (evt: any) => {
  const bucketName = evt.Records[0].s3.bucket.name;
  const objectKey = evt.Records[0].s3.object.key;

  const client = new S3.S3Client({});

  const getObjectCommand = new S3.GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey
  })

  try {
    const object = (await client.send(getObjectCommand));
    
    const updateOrderMovementOnUploadTypeAnswer = updateOrderMovementOnUploadType.safeParse(object.Metadata);
    
    if (!updateOrderMovementOnUploadTypeAnswer.success) {
      console.error("Invalid metadata: ", updateOrderMovementOnUploadTypeAnswer.error.flatten());
      deleteObject(objectKey, bucketName, client);
      return;
    }

    const foundOrderMovement = await db.query.order_movement.findFirst({
      where: (order_movement) => eq(order_movement.id, updateOrderMovementOnUploadTypeAnswer.data.id),
      columns: {
        recipt_key: true
      }
    });

    if (!foundOrderMovement) {
      await deleteObject(objectKey, bucketName, client);
      console.error("Order movement not found");
    } else {
      const { recipt_key: existingKey } = foundOrderMovement;
      const { key: newKey } = updateOrderMovementOnUploadTypeAnswer.data;

      if (existingKey !== newKey) {
        if (existingKey) {
          await deleteObject(existingKey, bucketName, client);
        }
        await db.update(order_movement).set({
          recipt_key: newKey
        }).where(eq(order_movement.id, updateOrderMovementOnUploadTypeAnswer.data.id));
      }
    }
    
  } catch (error) {
    deleteObject(objectKey, bucketName, client);
  }
  return;
};

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

export default updateOrderMovementOnUploadHandler;