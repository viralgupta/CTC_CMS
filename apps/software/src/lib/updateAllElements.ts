import { allAddressAtom, AddressType } from "@/store/address";
import { allArchitectAtom, ArchitectType } from "@/store/architect";
import { allCarpenterAtom, CarpenterType } from "@/store/carpenter";
import { allCustomerAtom, CustomerType } from "@/store/Customer";
import { allDriverAtom, DriverType } from "@/store/driver";
import { allEstimateAtom, EstimateType } from "@/store/estimates";
import { allItemsAtom, itemType } from "@/store/Items";
import { allResourcesAtom, ResourceType } from "@/store/resources";
import { allOrdersAtom, defaultAllOrders } from "@/store/order";
import { getRecoil, setRecoil } from 'recoil-nexus'

type AllowedTypes =
  | (AddressType & { _?: true })
  | (ArchitectType & { _?: true })
  | (CarpenterType & { _?: true })
  | (CustomerType & { _?: true })
  | (DriverType & { _?: true })
  | (EstimateType & { _?: true })
  | (itemType & { _?: true })
  | (ResourceType & { _?: true });

function calculateNewValues<T extends AllowedTypes>({
  previousValues,
  newValue,
}: {
  previousValues: T[];
  newValue: T;
}): T[] {
  const newValues = previousValues.filter((value) => value.id !== newValue.id);
  if (newValue?._ == true) {
    return newValues;
  } else {
    return [newValue, ...newValues];
  }
}

function updateAllElements(
  values: [
    {
      type:
        | "address"
        | "architect"
        | "carpenter"
        | "customer"
        | "driver"
        | "estimate"
        | "item"
        | "order"
        | "resource";
      data: any;
    },
  ]
) {
  const addresses = getRecoil(allAddressAtom);
  const architects = getRecoil(allArchitectAtom);
  const carpenters = getRecoil(allCarpenterAtom);
  const customers = getRecoil(allCustomerAtom);
  const drivers = getRecoil(allDriverAtom);
  const estimates = getRecoil(allEstimateAtom);
  const items = getRecoil(allItemsAtom);
  const resources = getRecoil(allResourcesAtom);

  values.forEach((value) => {
    switch (value.type) {
      case "address":
        setRecoil(allAddressAtom,
          calculateNewValues({
            previousValues: addresses,
            newValue: value.data,
          })
        );
        break;
      case "architect":
        setRecoil(allArchitectAtom,
          calculateNewValues({
            previousValues: architects,
            newValue: value.data,
          })
        );
        break;
      case "carpenter":
        setRecoil(allCarpenterAtom,
          calculateNewValues({
            previousValues: carpenters,
            newValue: value.data,
          })
        );
        break;
      case "customer":
        setRecoil(allCustomerAtom,
          calculateNewValues({
            previousValues: customers,
            newValue: value.data,
          })
        );
        break;
      case "driver":
        setRecoil(allDriverAtom,
          calculateNewValues({
            previousValues: drivers,
            newValue: value.data,
          })
        );
        break;
      case "estimate":
        setRecoil(allEstimateAtom,
          calculateNewValues({
            previousValues: estimates,
            newValue: value.data,
          })
        );
        break;
      case "item":
        setRecoil(allItemsAtom,
          calculateNewValues({
            previousValues: items,
            newValue: value.data,
          })
        );
        break;
      case "order":
        setRecoil(allOrdersAtom, defaultAllOrders);
        break;
      case "resource":
        setRecoil(allResourcesAtom,
          calculateNewValues({
            previousValues: resources,
            newValue: value.data,
          })
        );
        break;
      default:
        break;
    }
  });
}

export { updateAllElements };
