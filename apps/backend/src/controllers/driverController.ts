import db from '@db/db';
import { driver, phone_number } from '@db/schema';
import { createDriverType, deleteDriverType, editDriverType, getDriverType } from '@type/api/driver';
import { Request, Response } from "express";
import { eq } from "drizzle-orm";

const createDriver = async (req: Request, res: Response) => {
  const createDriverTypeAnswer = createDriverType.safeParse(req.body);

  if (!createDriverTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createDriverTypeAnswer.error.flatten()})
  }

  try {
    const createdDriver = await db.transaction(async (tx) => {

      const tDriver = await tx.insert(driver).values({
        name: createDriverTypeAnswer.data.name,
        profileUrl: createDriverTypeAnswer.data.profileUrl,
        vehicle_number: createDriverTypeAnswer.data.vehicle_number,
        size_of_vehicle: createDriverTypeAnswer.data.size_of_vehicle
      }).returning();

      const numberswithPrimary = createDriverTypeAnswer.data.phone_numbers.filter((phone_number) => phone_number.isPrimary);

      const primaryPhoneIndex = createDriverTypeAnswer.data.phone_numbers.findIndex((phone_number) => phone_number.isPrimary);

      if(numberswithPrimary.length !== 1 && createDriverTypeAnswer.data.phone_numbers.length > 0){
        createDriverTypeAnswer.data.phone_numbers.forEach((phone_number) => {
          phone_number.isPrimary = false;
        })
        if (primaryPhoneIndex !== -1) {
          createDriverTypeAnswer.data.phone_numbers[primaryPhoneIndex].isPrimary = true;
        } else {
          createDriverTypeAnswer.data.phone_numbers[0].isPrimary = true;
        }
      }


      await tx.insert(phone_number).values(
        createDriverTypeAnswer.data.phone_numbers.map((phone_number) => {
          return {
            driver_id: tDriver[0].id,
            phone_number: phone_number.phone_number,
            country_code: phone_number.country_code,
            isPrimary: phone_number.isPrimary,
            whatsappChatId: phone_number.whatsappChatId
          };
        })
      );

      return tDriver[0];
    })
    
    return res.status(200).json({success: true, message: "Driver created successfully", data: createdDriver});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create driver", error: error.message ? error.message : error});
  }
}

const editDriver = async (req: Request, res: Response) => {
  const editDriverTypeAnswer = editDriverType.safeParse(req.body);

  if (!editDriverTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editDriverTypeAnswer.error?.flatten()})
  }

  try {

    const tDriver = await db.select({id: driver.id}).from(driver).where(eq(driver.id, editDriverTypeAnswer.data.driver_id));
    if(tDriver.length === 0){
      return res.status(400).json({ success: false, message: "Driver not found" });
    }

    const updatedDriver = await db.update(driver).set({
      name: editDriverTypeAnswer.data.name,
      profileUrl: editDriverTypeAnswer.data.profileUrl,
      vehicle_number: editDriverTypeAnswer.data.vehicle_number,
      size_of_vehicle: editDriverTypeAnswer.data.size_of_vehicle
    }).where(eq(driver.id, editDriverTypeAnswer.data.driver_id))
    .returning();

    return res.status(200).json({success: true, message: "Driver Edited Successfully", data: updatedDriver[0]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to edit driver", error: error.message ? error.message : error});
  }
}

const getDriver = async (req: Request, res: Response) => {
  
  const getDriverTypeAnswer = getDriverType.safeParse(req.query);

  if (!getDriverTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getDriverTypeAnswer.error?.flatten()})
  }

  try {
    const foundDriver = await db.query.driver.findFirst({
      where: (driver, { eq }) => eq(driver.id, getDriverTypeAnswer.data.driver_id),
      with: {
        phone_numbers: {
          columns: {
            id: true,
            phone_number: true,
            country_code: true,
            isPrimary: true,
            whatsappChatId: true
          }
        },
        orders: {
          orderBy: (order, { desc }) => [desc(order.created_at)],
          columns: {
            id: true,
            status: true,
            created_at: true
          },
          with: {
            delivery_address: {
               columns: {
                 house_number: true,
                 address: true,
               }
            },
            customer: {
              columns: {
                name: true
              }
            }
          },
        }
      }
    })

    if(!foundDriver){
      return res.status(400).json({ success: false, message: "Driver not found" });
    }

    return res.status(200).json({success: true, message: "Driver found", data: foundDriver});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to get driver", error: error.message ? error.message : error});
  }
}

const deleteDriver = async (req: Request, res: Response) => {
    const deleteDriverTypeAnswer = deleteDriverType.safeParse(req.body);
  
    if (!deleteDriverTypeAnswer.success){
      return res.status(400).json({success: false, message: "Input fields are not correct", error: deleteDriverTypeAnswer.error?.flatten()})
    }
  
    try {
      await db.delete(driver).where(eq(driver.id, deleteDriverTypeAnswer.data.driver_id));
  
      return res.status(200).json({success: true, message: "Driver deleted successfully"});
    } catch (error: any) {
      return res.status(400).json({success: false, message: "Unable to delete driver", error: error.message ? error.message : error});
    }
}

const getAllDrivers = async (_req: Request, res: Response) => {
  try {

    const allDrivers = await db.query.driver.findMany({
      with: {
        phone_numbers: {
          columns: {
            phone_number: true
          },
          where: (phone_number, { eq }) => eq(phone_number.isPrimary, true),
        },
      },
      columns: {
        profileUrl: false,
        vehicle_number: false
      }
    });

    return res.status(200).json({success: true, message: "Drivers found", data: allDrivers});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to get drivers", error: error.message ? error.message : error});
  }
}

export {
  createDriver,
  editDriver,
  getDriver,
  deleteDriver,
  getAllDrivers  
}