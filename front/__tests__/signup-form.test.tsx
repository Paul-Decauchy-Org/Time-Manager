/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {render} from '@testing-library/react'
import { SignupForm } from '@/components/signup-form'
import { MockedProvider } from "@apollo/client/testing/react";
import { gql } from '@apollo/client';

jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            push: jest.fn(),
            prefetch: jest.fn(),
            };
        },
}));
describe( 'Signup form', () => {
    const UserSigned = { firstName: 'user', lastName: 'test', email : 'user@test.fr', phone: '111',  password : 'password', id : '1' }
    const mocks = [
        {
            request : {
                query : gql`
                mutation SignUp($input : SignUpInput!) {
                    signUp(input: $input){
                        id
    firstName
    lastName
    email
    phone
    password
    }
}`,
    variables: {
        SignUpInput: {
            email:'user@test.fr',
            firstName: 'user',
            lastName: 'test',
            password: 'password',
            phone: '111'
        }}
    },
    result:  {
        data: UserSigned
    }}
]
    it('should render a form', ()=>{
            
            const {container} = render(
            <MockedProvider mocks={mocks}>
            <SignupForm/>
            </MockedProvider>
        )
        expect(container).toBeInTheDocument()
        })
})
