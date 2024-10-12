import AllCustomersTable from './components/AllCustomersTable'
import CreateCustomer from './components/CreateCustomer'
import SearchCustomer from './components/SearchCustomer'

const Customer = () => {
  return (
    <div className='w-full h-full'>
    <div className='flex h-12 justify-between space-x-4'>
      <CreateCustomer>
        <div className='border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200 w-full'>
          Create New Customer
        </div>
      </CreateCustomer>
      <SearchCustomer/>
    </div>
    <div className='w-full h-full space-y-8'>
      <AllCustomersTable/>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
    </div>
  </div>
  )
}

export default Customer