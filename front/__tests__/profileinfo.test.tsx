/**
 * @jest-environment jsdom
 */


import '@testing-library/jest-dom' 
import { Variable } from 'lucide-react';
import { ProfileInfo } from '@/app/dashboard/me/profile-info';
import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing/react';
import { IconPassword } from '@tabler/icons-react';
import { render } from '@testing-library/react';

jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            push: jest.fn(),
            prefetch: jest.fn(),
            };
        },
}));

describe('profile info', ()=> {
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
        email : 'user@test.fr',
        firstName : 'user',
        lastName : 'test',
        password: 'password',
        phone: '111'
    }
},
    result: {
        data: profileInfo
    }

        }}

    ]
    it('should render the profile info box', ()=> {
        const container = render(
            <MockedProvider mocks={mocks}>
                <ProfileInfo/>
            </MockedProvider>
        ) 
                expect(container).toBeInTheDocument()

    })
})