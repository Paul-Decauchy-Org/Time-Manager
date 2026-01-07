/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom' 
import { DeleteAccount } from '@/app/dashboard/me/delete-account';
import { gql } from '@apollo/client';
import { MockedProvider } from "@apollo/client/testing/react";
import { fireEvent, render, screen } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { act } from 'react';

jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            push: jest.fn(),
            prefetch: jest.fn(),
            };
        },
}));
describe('delete profile', () => {
    beforeEach(() => {
    jest.resetAllMocks()
   })
    const mocks = [
        {
            request: {
            query: gql`mutation deleteProfile {
deleteProfile
}
`

            },
            result: {
                data: null
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
    it('should delete the account with confirmation', () => {
        render(
                <MockedProvider mocks={mocks}>
                    <AuthProvider>
                    <DeleteAccount/>
                    </AuthProvider>
                </MockedProvider>
        ) 
        act(() => {
        fireEvent.change(screen.getByLabelText('Type DELETE to confirm'), {
            target: {value : 'DELETE'}
        })
        fireEvent.click(screen.getByRole('delete'))
        })
        expect(screen.getByRole('field')).toHaveTextContent('Deleting Account...')

    })
    it('should not delete the account without confirmation', () => {
        render(
                <MockedProvider mocks={mocks}>
                    <AuthProvider>
                    <DeleteAccount/>
                    </AuthProvider>
                </MockedProvider>
        ) 
        expect(screen.getByRole('delete')).toBeDisabled()
    })
})