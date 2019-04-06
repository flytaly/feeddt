import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { StyledLightHalf as CardHalf } from '../styled/card-half';
import GraphQLError from '../graphql-error';

const Message = styled.div`
    border: 1px solid ${props => props.color};
    color: ${props => props.color};
    padding: 1rem;
    word-break: break-word;
    border-radius: 3px;
`;

const CardLeft = ({ messages: { error } }) => (
    <CardHalf>
        {(error) && (
            <Message color={error ? 'red' : 'green'} data-testid="login-message">
                {error && <GraphQLError error={error} />}
            </Message>)
        }
    </CardHalf>
);
CardLeft.propTypes = {
    messages: PropTypes.shape({
        error: PropTypes.string,
    }),
};
CardLeft.defaultProps = {
    messages: { error: '' },
};

export default CardLeft;