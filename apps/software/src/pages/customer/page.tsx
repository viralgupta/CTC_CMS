import React from 'react'
import CreateCustomer from './components/CreateCustomer'

const Customer = () => {
  return (
    <div className='w-full h-full'>
    <div className='flex h-12 justify-between space-x-4'>
      <CreateCustomer>
        <div className='border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200 w-full'>
          Create New Customer
        </div>
      </CreateCustomer>
      {/* <SearchItem/> */}
    </div>
    {/* <div className='w-full h-full space-y-8'>
      <LowStockItems/>
      <AllItems/>
      <ViewItem/>
      <EditItem/>
      <EditItemQuantity/>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
    </div> */}
  </div>
  )
}

export default Customer