import AllCarpenterTable from './components/AllCarpentersTable'
import CreateCarpenter from './components/CreateCarpenter'
import SearchCarpenter from './components/SearchCarpenter'

const Carpenter = () => {
  return (
    <div className='w-full h-full flex flex-col'>
    <div className='flex h-12 justify-between space-x-4 flex-none'>
      <CreateCarpenter>
        <div className='border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200 w-full'>
          Create New Carpenter
        </div>
      </CreateCarpenter>
      <SearchCarpenter/>
    </div>
    <AllCarpenterTable/>
  </div>
  )
}

export default Carpenter