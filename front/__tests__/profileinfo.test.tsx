/**
 * @jest-environment jsdom
 */


import '@testing-library/jest-dom' 
import { Variable } from 'lucide-react';
import { ProfileInfo } from '@/app/dashboard/me/profile-info';
import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing/react';
import { fireEvent, getByLabelText, render, screen } from '@testing-library/react';
import { Role, User } from '@/generated/graphql';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { act } from 'react';

jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            push: jest.fn(),
            prefetch: jest.fn(),
            };
        },
}));

describe('profile info', ()=> {
   beforeEach(() => {
    jest.resetAllMocks()
   })
    const profileInfo = { firstName: 'user', lastName: 'test', email : 'user@test.fr', phone: '111',  password : 'password' }
    const mocks = [
        { request :{
            query: gql`mutation updateProfile($input: UpdateProfileInput!) {
updateProfile(input: $input) {
    firstName
    lastName
    email
    phone
    password
    }
}`, variables :{
    UpdateProfileInput : {
        
        firstName : 'user',
        lastName : 'test',
        email : 'user@test.fr',
        password: 'password',
        phone: '111'
    }
},
    result: {
        data: profileInfo
    }

        }}

    ]
    it('should be defined with  auth context', ()=> {
        const container = render(
            <MockedProvider mocks={mocks}>
                <AuthProvider>
                    <ProfileInfo/>
                </AuthProvider>
            </MockedProvider>
        ) 
                expect(container).toBeDefined()

    })
    it(' should be able to submit with correct info', () =>{
        render(
            <MockedProvider mocks={mocks}>
                <AuthProvider>
                    <ProfileInfo/>
                </AuthProvider>
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
        fireEvent.change(screen.getByLabelText('Email'), {
                target : { value : 'user@test.fr' }
            })
        fireEvent.change(screen.getByLabelText('Phone'), {
                target : { value : '111' }
            })
        fireEvent.click(screen.getByRole('submit'))
        })
        expect(screen.getByRole('field')).toHaveTextContent('Updating Account...')
    })
    it('should not be able to submit if the password do not match', () => {
        render(
            <MockedProvider mocks={mocks}>
                <AuthProvider>
                    <ProfileInfo/>
                </AuthProvider>
            </MockedProvider>
        )
        act(() => { 
        fireEvent.change(screen.getByLabelText('First Name'), {
                target : { value : 'test' }
            })
        fireEvent.change(screen.getByLabelText('Last Name'), {
                target : { value : 'test' }
            })
        fireEvent.change(screen.getByLabelText('Password'), {
                target : { value : 'Password' }
            })
        fireEvent.change(screen.getByLabelText('Confirm Password'), {
                target : { value : 'Pastword' }
            })
        fireEvent.change(screen.getByLabelText('Email'), {
                target : { value : 'u@test.fr' }
            })
        fireEvent.change(screen.getByLabelText('Phone'), {
                target : { value : '111' }
            })
        fireEvent.click(screen.getByRole('submit'))
        })
        expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match')
    })
    
})