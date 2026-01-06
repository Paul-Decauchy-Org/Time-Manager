/**
 * @jest-environment jsdom
 */


import '@testing-library/jest-dom' 
import {fireEvent, render, screen} from '@testing-library/react'
import TeamKpiPage from '@/app/dashboard/kpi/team/page'
import { AuthProvider } from '@/contexts/AuthContext'

describe('team kpi page', ()=> {
    it('should render the page', () => {
        const {container} = render(<TeamKpiPage />)
        expect(container).toBeInTheDocument()
    })
})