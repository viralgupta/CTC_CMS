import db from "@db/db";
import { phone_number, resource } from "@db/schema";
import { createGetSignedURLType, createPhoneType, createPutSignedURLType, deletePhoneType, deleteResourceType, editResourceType, getAllLogsType, getLogType } from "@type/api/miscellaneous";
import { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import * as S3 from "@aws-sdk/client-s3"
import { Bucket } from "sst/node/bucket";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { Config } from "sst/node/config";
import mime from "mime";

const createPhone = async (req: Request, res: Response) => {
  const createPhoneTypeAnswer = createPhoneType.safeParse(req.body);

  if (!createPhoneTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createPhoneTypeAnswer.error.flatten()})
  }

  try {

    await db.transaction(async (tx) => {
      if(createPhoneTypeAnswer.data.isPrimary){
        await tx.update(phone_number).set({isPrimary: false}).where(
          createPhoneTypeAnswer.data.customer_id
          ? and(
              eq(phone_number.customer_id, createPhoneTypeAnswer.data.customer_id),
              eq(phone_number.isPrimary, true)
            )
          : createPhoneTypeAnswer.data.architect_id
          ? and(
              eq(phone_number.architect_id, createPhoneTypeAnswer.data.architect_id),
              eq(phone_number.isPrimary, true)
            )
          : createPhoneTypeAnswer.data.carpanter_id
          ? and(
              eq(phone_number.carpanter_id, createPhoneTypeAnswer.data.carpanter_id),
              eq(phone_number.isPrimary, true)
            )
          : createPhoneTypeAnswer.data.driver_id
          ? and(
              eq(phone_number.driver_id, createPhoneTypeAnswer.data.driver_id),
              eq(phone_number.isPrimary, true)
            )
          : undefined
        );
      } else if (createPhoneTypeAnswer.data.isPrimary == false || createPhoneTypeAnswer.data.isPrimary == undefined){
        // check if there is a primary phone number, if not make this one primary

        const foundPhone = await tx.query.phone_number.findFirst({
          where: (phone_number, { eq, and }) => {
            if(createPhoneTypeAnswer.data.customer_id){
              return and(
                eq(phone_number.customer_id, createPhoneTypeAnswer.data.customer_id),
                eq(phone_number.isPrimary, true)
              )
            } else if(createPhoneTypeAnswer.data.architect_id){
              return and(
                eq(phone_number.architect_id, createPhoneTypeAnswer.data.architect_id),
                eq(phone_number.isPrimary, true)
              )
            } else if(createPhoneTypeAnswer.data.carpanter_id){
              return and(
                eq(phone_number.carpanter_id, createPhoneTypeAnswer.data.carpanter_id),
                eq(phone_number.isPrimary, true)
              )
            } else if(createPhoneTypeAnswer.data.driver_id){
              return and(
                eq(phone_number.driver_id, createPhoneTypeAnswer.data.driver_id),
                eq(phone_number.isPrimary, true)
              )
            }
          },
          columns: {
            isPrimary: true
          }
        })

        if(!foundPhone){
          createPhoneTypeAnswer.data.isPrimary = true;
        }
      }

      await tx.insert(phone_number).values(createPhoneTypeAnswer.data);
    })
    
    
    return res.status(200).json({success: true, message: "Phone number added"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to add phone number", error: error.message ? error.message : error});
  }
}

const deletePhone = async (req: Request, res: Response) => {
  const deletePhoneTypeAnswer = deletePhoneType.safeParse(req.body);


  if (!deletePhoneTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: deletePhoneTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {

      const foundPhone = await tx.query.phone_number.findFirst({
        where: (phone_number, { eq }) => eq(phone_number.id, deletePhoneTypeAnswer.data.phone_number_id),
        columns: {
          customer_id: true,
          architect_id: true,
          carpanter_id: true,
          driver_id: true,
          country_code: true,
          phone_number: true,
          isPrimary: true,
        }
      })

      if(!foundPhone){
        throw new Error("Phone number not found");
      }

      if(foundPhone.isPrimary === true){
        // try to find another phone number and make it primary

        const nonPrimaryPhones = await tx.select().from(phone_number).where(
          foundPhone.customer_id
          ? and(
              eq(phone_number.customer_id, foundPhone.customer_id),
              eq(phone_number.isPrimary, false)
            )
          : foundPhone.architect_id
          ? and(
              eq(phone_number.architect_id, foundPhone.architect_id),
              eq(phone_number.isPrimary, false)
            )
          : foundPhone.carpanter_id
          ? and(
              eq(phone_number.carpanter_id, foundPhone.carpanter_id),
              eq(phone_number.isPrimary, false)
            )
          : foundPhone.driver_id
          ? and(
              eq(phone_number.driver_id, foundPhone.driver_id),
              eq(phone_number.isPrimary, false)
            )
          : undefined
        );

        if (nonPrimaryPhones.length == 0){
          throw new Error("Minimum 1 Phone Number is required!");
        }

        await tx.update(phone_number).set({ isPrimary: true }).where(eq(phone_number.id, nonPrimaryPhones[0].id))
      }

      await tx.delete(phone_number).where(eq(phone_number.id, deletePhoneTypeAnswer.data.phone_number_id));
    })
    
    return res.status(200).json({success: true, message: "Phone number deleted"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to delete phone number", error: error.message ? error.message : error});
  };
}

const createPutSignedURL = async (req: Request, res: Response) => {
  const createPutSignedURLTypeAnswer = createPutSignedURLType.safeParse(req.body);

  if (!createPutSignedURLTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createPutSignedURLTypeAnswer.error.flatten()})
  }

  try {
    const uuid = crypto.randomUUID();
    const key = `${uuid}/${createPutSignedURLTypeAnswer.data.file_name}.${createPutSignedURLTypeAnswer.data.extension.toLowerCase()}`;

    const command = new S3.PutObjectCommand({
      ACL: "private",
      Key: key,
      Bucket: Bucket.ResourceBucket.bucketName,
      ContentType: mime.getType(createPutSignedURLTypeAnswer.data.extension.toLowerCase()) ?? "application/octet-stream",
      Metadata: {
        "Name": createPutSignedURLTypeAnswer.data.name,
        "Description": createPutSignedURLTypeAnswer.data.description ?? "",
        "Key": key
      }
    });

    const url = await getSignedUrl(new S3.S3Client({}), command, {
      expiresIn: Config.STAGE == 'dev' ? 60 * 60 : 60 * 5, // 60 / 5 minutes
    });

    return res.status(200).json({success: true, message: "Signed URL created", data: url});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create signed URL", error: error.message ? error.message : error});
  }
}

const editResource = async (req: Request, res: Response) => {
  const editResourceTypeAnswer = editResourceType.safeParse(req.body);

  if (!editResourceTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editResourceTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      await tx.update(resource).set(editResourceTypeAnswer.data).where(eq(resource.id, editResourceTypeAnswer.data.resource_id));
    });

    return res.status(200).json({success: true, message: "Resource updated"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update resource", error: error.message ? error.message : error});
  }
}

const deleteResource = async (req: Request, res: Response) => {
  const deleteResourceTypeAnswer = deleteResourceType.safeParse(req.body);

  if (!deleteResourceTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: deleteResourceTypeAnswer.error.flatten()})
  }

  try {

    const resource = await db.query.resource.findFirst({
      where: (resource, { eq }) => eq(resource.id, deleteResourceTypeAnswer.data.resource_id),
      columns: {
        key: true
      }
    })

    if(!resource){
      return res.status(400).json({success: false, message: "Resource not found"});
    }

    const client = new S3.S3Client({});

    const command = new S3.DeleteObjectCommand({
      Bucket: Bucket.ResourceBucket.bucketName,
      Key: resource.key
    });

    const response = await client.send(command);
    
    if(response.$metadata.httpStatusCode !== 204){
      return res.status(400).json({success: false, message: "Unable to delete resource"});
    }

    return res.status(200).json({success: true, message: "Deletion in progress..."});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to delete resource", error: error.message ? error.message : error});
  }
}

const createGetSignedURL = async (req: Request, res: Response) => {
  const createGetSignedURLTypeAnswer = createGetSignedURLType.safeParse(req.query);

  if (!createGetSignedURLTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createGetSignedURLTypeAnswer.error.flatten()})
  }

  try {

    const resource = await db.query.resource.findFirst({
      where: (resource, { eq }) => eq(resource.id, createGetSignedURLTypeAnswer.data.resource_id),
      columns: {
        id: true,
        key: true,
        name: true,
        description: true,
        extension: true
      }
    })

    if(!resource){
      return res.status(400).json({success: false, message: "Resource not found"});
    }

    const command = new S3.GetObjectCommand({
      Bucket: Bucket.ResourceBucket.bucketName,
      Key: resource.key,
    });

    const url = await getSignedUrl(new S3.S3Client({}), command, {
      expiresIn: Config.STAGE == 'dev' ? 60 * 60 : 60 * 5, // 60 / 5 minutes
    });

    const resourceWithUrl = {
      ...resource,
      url
    }

    return res.status(200).json({success: true, message: "Resource Found", data: resourceWithUrl});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to find Resource!", error: error.message ? error.message : error});
  }
}

type Resource = {
  id: number;
  name: string;
  previewKey: string | null | undefined;
  previewUrl?: string;
};

type ReturnResource = {
  id: number;
  name: string;
  previewUrl?: string;
};

const getAllResources = async (_req: Request, res: Response) => {
  try {
    const resources = await db.query.resource.findMany({
      columns: {
        id: true,
        name: true,
        previewKey: true,
        extension: true
      }
    });

    const resourcesWithPreviewUrl = await Promise.all(
      resources.map(async (resource: Resource) => {
        if (resource.previewKey) {
          const command = new S3.GetObjectCommand({
            Bucket: Bucket.ResourceBucket.bucketName,
            Key: resource.previewKey,
          });
    
          const url = await getSignedUrl(new S3.S3Client({}), command);
          resource.previewUrl = url;
        }
        resource.previewKey = undefined;
        return resource as ReturnResource;
      })
    );

    return res.status(200).json({success: true, message: "Resources fetched", data: resourcesWithPreviewUrl});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch resources", error: error.message ? error.message : error});
  }
}

const getLog = async (req: Request, res: Response) => {
  const getLogTypeAnswer = getLogType.safeParse(req.query);

  if (!getLogTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getLogTypeAnswer.error.flatten()})
  }

  try {
    const foundLog = await db.query.log.findFirst({
      where: (log, { eq }) => eq(log.id, getLogTypeAnswer.data.id),
      with: {
        user: {
          columns: {
            name: true
          }
        }
      }
    });

    return res.status(200).json({success: true, message: "Log Fetched", data: foundLog});

  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch log", error: error.message ? error.message : error});
  }
}

const getAllLogs = async (req: Request, res: Response) => {
  const getAllLogTypeAnswer = getAllLogsType.safeParse(req.query);

  if (!getAllLogTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getAllLogTypeAnswer.error.flatten()})
  }

  try {
    const key = Object.keys(getAllLogTypeAnswer.data).length > 0 ? Object.keys(getAllLogTypeAnswer.data)[0] as "user_id" | "customer_id" | "architect_id" | "carpanter_id" | "driver_id" | "item_id" | "order_id" : undefined;
    const value = key ? getAllLogTypeAnswer.data[key] : undefined;
    const foundLog = await db.query.log.findMany({
      where: (log, { eq, and, lt }) => {
        if(!key || !value){
          if(getAllLogTypeAnswer.data.linked_to){
            if (getAllLogTypeAnswer.data.cursor){
              return and(eq(log.linked_to, getAllLogTypeAnswer.data.linked_to), lt(log.id, getAllLogTypeAnswer.data.cursor));
            } else {
              return eq(log.linked_to, getAllLogTypeAnswer.data.linked_to);
            }
          } else if(getAllLogTypeAnswer.data.cursor){
            return lt(log.id, getAllLogTypeAnswer.data.cursor);
          } else {
            return undefined;
          }
        } else if(getAllLogTypeAnswer.data.cursor){
          return and(eq(log[key], value), lt(log.id, getAllLogTypeAnswer.data.cursor));
        } else {
          return eq(log[key], value);
        }
      },
      columns: {
        id: true,
        heading: true,
        type: true,
        linked_to: true,
        created_at: true
      },
      with: {
        user: {
          columns: {
            name: true
          }
        }
      },
      orderBy: (log, { desc }) => desc(log.id),
      limit: 10
    });

    return res.status(200).json({success: true, message: "Logs Fetched", data: foundLog});

  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch log", error: error.message ? error.message : error});
  }
}

export {
  createPhone,
  deletePhone,
  createPutSignedURL,
  editResource,
  createGetSignedURL,
  deleteResource,
  getAllResources,
  getAllLogs,
  getLog,
}