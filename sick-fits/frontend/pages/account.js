import {useUser} from '../components/User'

export default function OrderPage() {
  const me = useUser();
  if(!me) return null;

    return <div><h1>Account Information</h1><hr/>
     <p>Name: {me.name}</p>
     <p>Email: {me.email}</p>
    </div>
  }
  
  