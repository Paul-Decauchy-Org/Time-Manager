/**
 * @jest-environment jsdom
 */


import '@testing-library/jest-dom' 
import {fireEvent, render, screen} from '@testing-library/react'
import AdminKpiPage from '@/app/dashboard/kpi/admin/page'

describe('me Page', ()=> {
    it('should render the page', () => {
        const {container} = render(<AdminKpiPage />)
        expect(container).toBeInTheDocument()
    })
})