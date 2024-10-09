import CreateItem from './components/CreateItem'
import SearchItem from './components/SearchItem'
import LowStockItems from './components/LowStockItems'
import AllItems from './components/AllItems'
import ViewItem from './components/ViewItem/ViewItem'

const Inventory = () => {
  return (
    <div className='w-full h-full'>
      <div className='flex h-12 justify-between space-x-4'>
        <CreateItem>
          <div className='border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200 w-full'>
            Create New Item
          </div>
        </CreateItem>
        <SearchItem/>
      </div>
      <div className='w-full h-full space-y-8'>
        <LowStockItems/>
        <AllItems/>
        <ViewItem/>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
      </div>
    </div>
  )
}

export default Inventory