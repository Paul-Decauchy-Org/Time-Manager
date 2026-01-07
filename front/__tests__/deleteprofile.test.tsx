/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom' 
import { DeleteAccount } from '@/app/dashboard/me/delete-account';
import { gql } from '@apollo/client';
import { MockedProvider } from "@apollo/client/testing/react";
import { render } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';

jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            push: jest.fn(),
            prefetch: jest.fn(),
            };
        },
}));
describe('delete profile', () => {
    const mocks = [
        {
            request: {
            query: gql`mutation deleteProfile {
deleteProfile
}
`
            }
        }
    ]
    it('should render the deleting account component', ()=> {
            const {container} = render(
                <MockedProvider mocks={mocks}>
                    <AuthProvider>
                    <DeleteAccount/>
                    </AuthProvider>
                </MockedProvider>
            ) 
            expect(container).toBeInTheDocument()

        })
})