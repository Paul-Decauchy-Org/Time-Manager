/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { LoginForm } from "@/components/login-form";
import { MockedProvider } from "@apollo/client/testing/react";
import { useMutation } from "@apollo/client/react";
import { LoginDocument, LoginMutation } from "@/generated/graphql";
import { gql } from "@apollo/client";

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));
describe('LoginForm', () =>{
  beforeEach(() => {
    jest.resetAllMocks()
   })
    const UserLogged = { firstName: 'user', lastName: 'test', email : 'user@test.fr', phone: '111',role: 't', token:'jijon' }
    const mocks = [ 
        {
    request: {
      query: gql`
      mutation login($email: String!,$password: String!) {
        login(email: $email, password: $password) {
    token
    email
    phone
    firstName
    lastName
    role
  }
}
      `,
        variables: {
          email: "user@test.fr",
          password: "password",
        },
      },
      result: {
        data: UserLogged,
      },
    },
  ];
  it("should render a form", () => {
    const { container } = render(
      <MockedProvider mocks={mocks}>
        <LoginForm />
      </MockedProvider>,
    );
    expect(container).toBeInTheDocument();
  });
});
