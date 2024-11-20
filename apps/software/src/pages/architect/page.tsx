import AllArchitectTable from './components/AllArchitectsTable'
import CreateArchitect from './components/CreateArchitect'
import SearchArchitect from './components/SearchArchitect'

const Architect = () => {
  return (
    <div className='w-full h-full flex flex-col'>
      <div className='flex h-12 justify-between space-x-4 flex-none'>
        <CreateArchitect>
          <div className='border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200 w-full'>
            Create New Architect
          </div>
        </CreateArchitect>
        <SearchArchitect/>
      </div>
      <AllArchitectTable/>
  </div>
  )
}

export default Architect