/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom' 
import { ClockOut } from '@/components/clock-out';
import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing/react';
import { render } from '@testing-library/react';

jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            push: jest.fn(),
            prefetch: jest.fn(),
            };
        },
}));

describe('clockout', ()=> {
    const clockout  = { id : '1', arrival : '10:10', departure :'12:00', status : 'unfinished' }
    const mocks = [
        {
            request :{
                query:gql`mutation clockIn {
  clockIn {
    id
    arrival
    departure
    status
  }
}`,
    results: {
        data: clockout
    }

            }
        }
    ]
    it('should render clockin', () => {
        const container = render(
            <MockedProvider mocks={mocks}>
                <ClockOut/>
            </MockedProvider>
        )
        expect(container).toBeInTheDocument()
    })
})