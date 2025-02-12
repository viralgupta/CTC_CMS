import AllCustomersTable from './components/AllCustomersTable'
import CreateCustomer from './components/CreateCustomer'
import SearchCustomer from './components/SearchCustomer'

const Customer = () => {
  return (
    <div className='w-full h-full flex flex-col'>
    <div className='flex h-12 justify-between space-x-4 flex-none'>
      <CreateCustomer>
        <div className='border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200 w-full'>
          Create New Customer
        </div>
      </CreateCustomer>
      <SearchCustomer/>
    </div>
    <AllCustomersTable/>
  </div>
  )
}

export default Customer