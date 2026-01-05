/**
 * @jest-environment jsdom
 */


import '@testing-library/jest-dom' 
import {fireEvent, render, screen} from '@testing-library/react'
import UserKpiPage from '@/app/dashboard/kpi/user/page'

describe('user kpi page', ()=> {
    it('should render the page', () => {
        const {container} = render(<UserKpiPage />)
        expect(container).toBeInTheDocument()
    })
})