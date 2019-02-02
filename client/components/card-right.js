import React from 'react';
import styled from 'styled-components';
import CardHalf from './styled/card-half';
import AddFeedForm from './add-feed-form';

const StyledHalf = styled(CardHalf)`
    background: ${props => props.theme.greyLight};
    border: 1px solid ${props => props.theme.greyDark};
    border-radius: 10px;
`;

const Login = styled.a`
    font-size: 1.3rem;
    align-self: flex-end;
`;

const WelcomeLeft = props => (
    <StyledHalf>
        <Login href="#">Login</Login>
        <AddFeedForm {...props} />
    </StyledHalf>
);

export default WelcomeLeft;
