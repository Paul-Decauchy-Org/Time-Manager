/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom' 
import {fireEvent, render, screen} from '@testing-library/react'
import LoginPage from '@/app/login/page'


describe('LoginPage', ()=> {
    it('should render the page', () => {
        const {container} = render(<LoginPage />)
        expect(container).toBeInTheDocument()
    })
})