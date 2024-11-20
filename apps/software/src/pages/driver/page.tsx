import AllDriverTable from './components/AllDriversTable'
import CreateDriver from './components/CreateDriver'
import SearchDriver from './components/SearchDriver'

const Driver = () => {
  return (
    <div className='w-full h-full flex flex-col'>
    <div className='flex h-12 justify-between space-x-4 flex-none'>
      <CreateDriver>
        <div className='border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200 w-full'>
          Create New Driver
        </div>
      </CreateDriver>
      <SearchDriver/>
    </div>
    <AllDriverTable/>
  </div>
  )
}

export default Driver