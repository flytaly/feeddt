import React, { useState } from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components';
import { useQuery } from 'react-apollo-hooks';
import { useGlobalState, useDispatch, types } from './state';
import AddFeedForm from './welcome/add-feed-form';
import GraphQLError from './graphql-error';
import ME_QUERY from '../queries/me-query';

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: ${props => props.theme.cardWidth / 2}rem;
`;

const Message = styled.div`
    border: 1px solid ${props => props.color};
    color: ${props => props.color};
    padding: 1rem;
    word-break: break-word;
    border-radius: 3px;
`;

const AddNewFeedModal = () => {
    const { data = { me: {} } } = useQuery(ME_QUERY);
    const user = data.me;
    const [messages, setMessages] = useState({ error: '', success: '' });
    const { error, success } = messages;
    const modal = useGlobalState('newFeedModal');
    const dispatch = useDispatch();
    const toggleModal = () => { dispatch({ type: types.toggleNewFeedModal }); };

    return (
        <ReactModal
            isOpen={modal.isOpen}
            contentLabel="Add new feed"
            shouldReturnFocusAfterClose
            onRequestClose={() => toggleModal()}
            shouldCloseOnEsc
            shouldCloseOnOverlayClick
            style={{
                overlay: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                content: {
                    position: 'static',
                    textAlign: 'center',
                },
            }}
        >
            <FormContainer>
                {(error || success) && (
                    <Message color={error ? 'red' : 'green'}>
                        {error && <GraphQLError error={error} />}
                        {success}
                    </Message>)
                }
                <AddFeedForm setMessages={setMessages} user={user} />
            </FormContainer>
        </ReactModal>
    );
};

export default AddNewFeedModal;
