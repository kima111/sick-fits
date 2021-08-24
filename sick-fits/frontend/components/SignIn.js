import Form from './styles/Form'
import useForm from '../lib/useForm'
import { isTSExpressionWithTypeArguments } from '@babel/types'
import gql from 'graphql-tag'
import { CURRENT_USER_QUERY } from './User'
import { useMutation } from '@apollo/client'
import Error from './ErrorMessage'

const SIGNIN_MUTATION = gql`
    mutation SIGNIN_MUTATION($email: String!, $password: String!){
        authenticateUserWithPassword(email: $email, password: $password){  
            ...on UserAuthenticationWithPasswordSuccess{
                item{
                    id
                    email
                    name
                }
            }
            ...on UserAuthenticationWithPasswordFailure{
                code
                message
            }
        }
    }
`

export default function SignIn(){
    const {inputs, handleChange, resetForm} = useForm({
        email: '', 
        password: '',
    });
    const [signin, {data, laoding}] = useMutation(SIGNIN_MUTATION, {
        variables: inputs,
        // refectch the currently logged in use 
        refetchQueries: [{ query: CURRENT_USER_QUERY}]
    })

    async function handleSubmit(e){
        e.preventDefault();
        console.log(inputs);
        //Send the email and password to the graphqlAPI
        const res = await signin()
        console.log(res)
        resetForm()
    }
    const error = data?.authenticateUserWithPassword.__typename==="UserAuthenticationWithPasswordFailure"?data?.authenticateUserWithPassword:undefined;
    return(
    <Form method="POST" onSubmit={handleSubmit}>
     
            <h2>Sign Into Your Account</h2>
            <Error error={error}/>

            <fieldset>
            <label htmFor="email">
                Email
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Your Email Address" 
                    autoComplete="email"
                    value={inputs.email}
                    onChange={handleChange}
                />
                   
            </label>
            <label htmFor="password">
                Password
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    autoComplete="password"
                    value={inputs.password}
                    onChange={handleChange}
                />
            </label>
            <button type="submit">Sign In!</button>
        </fieldset>
    </Form>
    )
}