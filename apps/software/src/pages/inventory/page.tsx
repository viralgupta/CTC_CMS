import CreateItem from './components/CreateItem'
import SearchItem from './components/SearchItem'
import AllItems from './components/AllItems'
import Warehouse from './components/Warehouse/Warehouse'
import Tier from './components/Tiers/Tier'

const Inventory = () => {
  return (
    <div className='w-full h-full flex flex-col'>
      <div className='flex h-12 justify-between space-x-4 flex-none'>
        <CreateItem>
          <div className='border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200 w-full'>
            Create New Item
          </div>
        </CreateItem>
        <SearchItem/>
      </div>
      <div className='flex space-x-2 flex-none'>
        <Warehouse/>
        <Tier/>
      </div>
      <AllItems/>
    </div>
  )
}

export default Inventory