/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom' 
import { ClockOut } from '@/components/clock-out';
import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

describe('clockout', ()=> {
    beforeEach(() => {
    jest.resetAllMocks()
   })
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
        expect(container).toBeDefined()
    })
    it('should get to loading after click (and so take in consideration the click)', () =>{
        render(
            <MockedProvider mocks = {mocks}>
                <ClockOut/>
            </MockedProvider>
        )
        act(() =>{
        fireEvent.click(screen.getByRole('clockout'))
        })
        expect(screen.getByRole('field')).toHaveTextContent('Pointage en cours… Raccourci: Alt + O')
    })
})
