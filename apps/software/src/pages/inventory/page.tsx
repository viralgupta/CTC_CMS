import React from 'react'
import CreateItem from './components/CreateItem'

const Inventory = () => {
  return (
    <div className='w-full h-full'>
      <div className='flex h-12 justify-between'>
        <CreateItem>
          <div className='w-1/2 border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200'>
            Create New Item
          </div>
        </CreateItem>
      </div>
    </div>
  )
}

export default Inventory