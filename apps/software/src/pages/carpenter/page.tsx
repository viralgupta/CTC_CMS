import AllCarpenterTable from './components/AllCarpentersTable'
import CreateCarpenter from './components/CreateCarpenter'
import SearchCarpenter from './components/SearchCarpenter'

const Carpenter = () => {
  return (
    <div className='w-full h-full'>
    <div className='flex h-12 justify-between space-x-4'>
      <CreateCarpenter>
        <div className='border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200 w-full'>
          Create New Carpenter
        </div>
      </CreateCarpenter>
      <SearchCarpenter/>
    </div>
    <div className='w-full h-full space-y-8'>
      <AllCarpenterTable/>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
    </div>
  </div>
  )
}

export default Carpenter