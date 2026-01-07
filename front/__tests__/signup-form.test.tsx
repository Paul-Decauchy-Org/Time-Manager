/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {fireEvent, render, renderHook, screen} from '@testing-library/react'
import { SignupForm } from '@/components/signup-form'
import { MockedProvider } from "@apollo/client/testing/react";
import { gql } from '@apollo/client';
import React, { act } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useSignUp } from '@/hooks/signup';


jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));
describe( 'Signup form', () => {
    beforeEach(() => {
    jest.resetAllMocks()
   })
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
        input: {
            
            firstName: 'user',
            lastName: 'test',
            email:'user@test.fr',
            phone: '111',
            password: 'password'
            
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
    it('should contains the forms element', () => {
        render(
            <MockedProvider mocks={mocks}>
            <SignupForm onSubmit={jest.fn()}/>
            </MockedProvider>
        )
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(screen.getByLabelText('Phone number')).toBeInTheDocument()
        expect(screen.getByLabelText('Email address')).toBeInTheDocument()
        expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
        expect(screen.getByLabelText('First Name')).toBeInTheDocument()
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()


    })
    it('should be succesful with correct data', () => {
        const handleSubmit = jest.fn()
        render(
            <MockedProvider mocks={mocks}>
            <SignupForm onSubmit={handleSubmit}/>
            </MockedProvider>
        )
        act(() => {
        fireEvent.change(screen.getByLabelText('First Name'), {
            target : { value : 'user' }
        })
        fireEvent.change(screen.getByLabelText('Last Name'), {
            target : { value : 'test' }
        })
        fireEvent.change(screen.getByLabelText('Password'), {
            target : { value : 'password' }
        })
        fireEvent.change(screen.getByLabelText('Confirm Password'), {
            target : { value : 'password' }
        })
        fireEvent.change(screen.getByLabelText('Email address'), {
            target : { value : 'user@test.fr' }
        })
        fireEvent.change(screen.getByLabelText('Phone number'), {
            target : { value : '111' }
        })
        fireEvent.click(screen.getByRole('submit'))
    })
        expect(handleSubmit).toHaveBeenCalledTimes(1);
    })
    it('should fail with non matching password', () => {
        const handleSubmit = jest.fn()
        
        render(
            <MockedProvider mocks={mocks}>
            <SignupForm onSubmit={handleSubmit}/>
            </MockedProvider>
        )
        act(() => {
        fireEvent.change(screen.getByLabelText('First Name'), {
            target : { value : 'user' }
        })
        fireEvent.change(screen.getByLabelText('Last Name'), {
            target : { value : 'test' }
        })
        fireEvent.change(screen.getByLabelText('Password'), {
            target : { value : 'Password' }
        })
        fireEvent.change(screen.getByLabelText('Confirm Password'), {
            target : { value : 'PasTword' }
        })
        fireEvent.change(screen.getByLabelText('Email address'), {
            target : { value : 'u@test.fr' }
        })
        fireEvent.change(screen.getByLabelText('Phone number'), {
            target : { value : '111' }
        })
        fireEvent.click(screen.getByRole('submit'))
        })
        expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match');
    })

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
